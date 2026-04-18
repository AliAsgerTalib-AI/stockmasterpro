import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// EXTREME VERBOSITY FOR DEBUGGING
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const forcePreview = import.meta.env.VITE_FORCE_PREVIEW_MODE === 'true';

const diagnosticInfo = {
  rawUrl,
  rawKey: rawKey ? 'PRESENT' : 'MISSING',
  forcePreview,
  urlType: typeof rawUrl,
  urlLength: rawUrl?.length,
  isUndefinedString: rawUrl === 'undefined',
  isNull: rawUrl === null,
  isActuallyUndefined: typeof rawUrl === 'undefined'
};

console.group('Supabase Diagnostic Boot');
console.table(diagnosticInfo);

let isConfigured = Boolean(
  rawUrl && 
  rawUrl !== 'undefined' && 
  rawUrl.length > 10 && 
  rawUrl.startsWith('http') &&
  rawKey &&
  rawKey !== 'undefined' &&
  rawKey.length > 20
);

if (forcePreview) {
  console.log('NOTICE: Force Preview Mode enabled via environment.');
  isConfigured = false;
}

console.log('Is Configured Decision:', isConfigured);

let internalClient: any = null;
if (isConfigured) {
  try {
    console.log('Initiating createClient...');
    internalClient = createClient(rawUrl as string, rawKey as string);
    console.log('createClient success');
  } catch (e: any) {
    console.error('FAILED createClient internally:', e.message);
  }
} else {
  console.warn('Skipping createClient due to missing/invalid config');
}
console.groupEnd();

export { isConfigured };

// Proxy to prevent top-level crashes and "cannot read property of null" errors throughout the app
export const supabase = new Proxy(internalClient || {}, {
  get(target, prop) {
    if (!internalClient) {
      if (prop === 'auth') {
        return {
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          getSession: async () => ({ data: { session: null } }),
          signInWithOAuth: async () => ({ error: new Error('Supabase not configured') }),
          signOut: async () => ({ error: null }),
          getUser: async () => ({ data: { user: null } }),
        };
      }
      return () => {
        const dummy: any = {
          select: () => dummy,
          order: () => dummy,
          limit: () => dummy,
          from: () => dummy,
          on: () => dummy,
          channel: () => dummy,
          subscribe: () => dummy,
          unsubscribe: () => {},
          then: (cb: any) => {
            if (typeof cb === 'function') {
              return Promise.resolve(cb({ data: [], error: null }));
            }
            return Promise.resolve({ data: [], error: null });
          },
          catch: (cb: any) => Promise.resolve(),
        };
        return dummy;
      };
    }
    return (internalClient as any)[prop];
  }
}) as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleSupabaseError(error: any, operationType: OperationType, table: string) {
  const errInfo = {
    message: error.message || String(error),
    details: error.details || 'No details provided',
    hint: error.hint || 'No hint provided',
    code: error.code || 'UNKNOWN_CODE',
    operationType,
    table,
    timestamp: new Date().toISOString()
  };
  
  console.group('SUPABASE ERROR DIAGNOSTIC');
  console.error(`Operation: ${operationType.toUpperCase()} on table "${table}"`);
  console.error(`Status Code/Message: ${errInfo.message}`);
  console.log('Details:', errInfo.details);
  console.log('Hint:', errInfo.hint);
  console.log('Postgres Code:', errInfo.code);
  console.groupEnd();

  toast.error(`Database Error: ${errInfo.message}`, {
    description: errInfo.hint !== 'No hint provided' ? errInfo.hint : undefined
  });

  throw error;
}
