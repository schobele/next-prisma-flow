import { writeFile } from "../utils.js";
import { join } from "node:path";
import type { FlowGeneratorConfig, GeneratorContext } from "../types.js";
import { capitalize, formatGeneratedFileHeader, plural } from "../utils.js";

export async function generateFlowProvider(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	await Promise.all([
		generateFlowProviderComponent(config, context),
		generateFlowContext(config, context),
		generateFlowConfig(config, context),
	]);
}

async function generateFlowProviderComponent(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const modelAtomImports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(plural(modelName));
			const lowerPluralName = plural(lowerName);
			return `import {
  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,
} from './${lowerName}/atoms';`;
		})
		.join("\n");

	const initialDataTypes = config.models
		.map((modelName) => `${modelName.toLowerCase()}: Record<string, ${modelName}>`)
		.join(";\n  ");

	const storeInitialization = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(plural(modelName));
			const lowerPluralName = plural(lowerName);
			return `  // Initialize ${modelName} state
  if (initialData?.${lowerPluralName}) {
    store.set(base${pluralName}Atom, initialData.${lowerPluralName});
  }`;
		})
		.join("\n");

	const debugAtoms = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(plural(modelName));
			const lowerPluralName = plural(lowerName);
			return `    ${lowerName}: {
      data: base${pluralName}Atom,
      loading: ${lowerPluralName}LoadingAtom,
      error: ${lowerPluralName}ErrorAtom,
    },`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { Provider as JotaiProvider, createStore } from 'jotai';
import { DevTools } from 'jotai-devtools';
${modelAtomImports}
import type { FlowConfig, FlowContextValue, FlowState, FlowErrorBoundaryRef } from './flow-config';

// ============================================================================
// PROVIDER PROPS & CONTEXT
// ============================================================================

export interface FlowProviderProps {
  children: React.ReactNode;
  
  // SSR/Initial state support
  initialData?: Partial<FlowState>;
  
  // Global configuration
  config?: Partial<FlowConfig>;
  
  // Auth/User context
  user?: any | null;
  
  // Global event handlers
  onError?: (error: Error, context: string, modelName?: string) => void;
  onLoading?: (isLoading: boolean, modelName?: string) => void;
  
  // Store customization (for testing/SSR)
  store?: ReturnType<typeof createStore>;
}

const FlowContext = createContext<FlowContextValue | null>(null);

// ============================================================================
// FLOW PROVIDER COMPONENT
// ============================================================================

export function FlowProvider({
  children,
  initialData,
  config: userConfig,
  user,
  onError,
  onLoading,
  store: externalStore,
}: FlowProviderProps) {
  // Create or use provided store
  const store = useMemo(() => {
    const storeInstance = externalStore || createStore();
    
${storeInitialization}
    
    return storeInstance;
  }, [externalStore, initialData]);

  // Merge user config with defaults
  const config = useMemo((): FlowConfig => ({
    errorBoundary: true,
    devTools: process.env.NODE_ENV === 'development',
    autoRefresh: false,
    refreshInterval: 30000,
    ssrSafe: true,
    batchUpdates: true,
    optimisticUpdates: true,
    ...userConfig,
  }), [userConfig]);

  // Error boundary ref for programmatic error handling
  const errorBoundaryRef = useRef<FlowErrorBoundaryRef | null>(null);

  // Global error handler
  const handleError = useMemo(() => (error: Error, context: string, modelName?: string) => {
    console.error(\`[Flow Error] \${context}\${modelName ? \` (\${modelName})\` : ''}\`, error);
    
    if (onError) {
      onError(error, context, modelName);
    }
    
    // You could also report to error tracking service here
    // reportError(error, { context, modelName, user: user?.id });
  }, [onError, user]);

  // Context value
  const contextValue = useMemo((): FlowContextValue => ({
    config,
    user,
    store,
    onError: handleError,
    onLoading,
    errorBoundaryRef,
    // Utility methods
    clearAllData: () => {
${config.models
	.map((modelName) => {
		const pluralName = capitalize(plural(modelName));
		const lowerPluralName = plural(modelName.toLowerCase());
		return `      store.set(base${pluralName}Atom, {});
      store.set(${lowerPluralName}LoadingAtom, false);
      store.set(${lowerPluralName}ErrorAtom, null);`;
	})
	.join("\n")}
    },
    getDebugInfo: () => ({
      config,
      user: user ? { id: user.id, email: user.email } : null,
      hasErrors: Object.values({
${config.models
	.map((modelName) => {
		const lowerPluralName = plural(modelName.toLowerCase());
		return `        ${modelName.toLowerCase()}: store.get(${lowerPluralName}ErrorAtom),`;
	})
	.join("\n")}
      }).some(Boolean),
      isLoading: Object.values({
${config.models
	.map((modelName) => {
		const lowerPluralName = plural(modelName.toLowerCase());
		return `        ${modelName.toLowerCase()}: store.get(${lowerPluralName}LoadingAtom),`;
	})
	.join("\n")}
      }).some(Boolean),
      timestamp: new Date().toISOString(),
    }),
  }), [config, user, store, handleError, onLoading]);

  // Development helpers
  useEffect(() => {
    if (config.devTools && typeof window !== 'undefined') {
      // Expose debug utilities to window for development
      (window as any).__FLOW_DEBUG__ = {
        store,
        context: contextValue,
        atoms: {
${debugAtoms}
        },
      };
      
      console.log('🌊 Flow Provider initialized with debug tools');
      console.log('Available at: window.__FLOW_DEBUG__');
    }
  }, [config.devTools, store, contextValue]);

  return (
    <FlowContext.Provider value={contextValue}>
      <JotaiProvider store={store}>
        {config.errorBoundary ? (
          <FlowErrorBoundary 
            ref={errorBoundaryRef}
            onError={handleError}
            fallback={config.errorFallback}
          >
            {config.devTools && <DevTools />}
            {children}
          </FlowErrorBoundary>
        ) : (
          <>
            {config.devTools && <DevTools />}
            {children}
          </>
        )}
      </JotaiProvider>
    </FlowContext.Provider>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface FlowErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error, context: string) => void;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

const FlowErrorBoundary = forwardRef<FlowErrorBoundaryRef, FlowErrorBoundaryProps>(
  function FlowErrorBoundary(props, ref) {
    const [state, setState] = React.useState<{ hasError: boolean; error: Error | null }>({
      hasError: false,
      error: null,
    });

    const reset = React.useCallback(() => {
      setState({ hasError: false, error: null });
    }, []);

    useImperativeHandle(ref, () => ({
      reset,
    }), [reset]);

    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        setState({ hasError: true, error: new Error(event.message) });
        props.onError(new Error(event.message), 'Global Error Handler');
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        setState({ hasError: true, error });
        props.onError(error, 'Unhandled Promise Rejection');
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, [props]);

    if (state.hasError && state.error) {
      const FallbackComponent = props.fallback || DefaultErrorFallback;
      return React.createElement(FallbackComponent, { error: state.error, reset });
    }

    return React.createElement(React.Fragment, null, props.children);
  }
);

// Default error fallback component
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      padding: '2rem',
      margin: '1rem',
      border: '2px solid #ef4444',
      borderRadius: '0.5rem',
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    }}>
      <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Something went wrong
      </h2>
      <details style={{ marginBottom: '1rem' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
          Error details
        </summary>
        <pre style={{ 
          fontSize: '0.875rem', 
          overflow: 'auto', 
          padding: '0.5rem',
          backgroundColor: '#fee2e2',
          borderRadius: '0.25rem'
        }}>
          {error.message}
        </pre>
      </details>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '0.25rem',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  );
}

// ============================================================================
// CONTEXT HOOKS
// ============================================================================

export function useFlowContext(): FlowContextValue {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowContext must be used within a FlowProvider');
  }
  return context;
}

export function useFlowConfig(): FlowConfig {
  return useFlowContext().config;
}

export function useFlowUser<T = any>(): T | null {
  return useFlowContext().user;
}

export function useFlowStore() {
  return useFlowContext().store;
}

export function useFlowErrorBoundary() {
  const { errorBoundaryRef, onError } = useFlowContext();
  
  return {
    reset: () => errorBoundaryRef.current?.reset?.(),
    reportError: (error: Error, context: string) => onError(error, context),
  };
}

// Development helper hook
export function useFlowDebug() {
  const context = useFlowContext();
  
  return {
    getDebugInfo: context.getDebugInfo,
    clearAllData: context.clearAllData,
    store: context.store,
    config: context.config,
  };
}
`;

	const filePath = join(context.outputDir, "flow-provider.tsx");
	await writeFile(filePath, template);
}

async function generateFlowContext(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const template = `${formatGeneratedFileHeader()}// Flow context type definitions and utilities

import type { createStore } from 'jotai';
import type { FlowConfig, FlowState } from './flow-config';

// ============================================================================
// ERROR BOUNDARY REF TYPE
// ============================================================================

export interface FlowErrorBoundaryRef {
  reset: () => void;
}

// ============================================================================
// CONTEXT VALUE TYPE
// ============================================================================

export interface FlowContextValue {
  // Configuration
  config: FlowConfig;
  
  // User/Auth context
  user: any | null;
  
  // Jotai store instance
  store: ReturnType<typeof createStore>;
  
  // Event handlers
  onError: (error: Error, context: string, modelName?: string) => void;
  onLoading?: (isLoading: boolean, modelName?: string) => void;
  
  // Error boundary ref
  errorBoundaryRef: React.MutableRefObject<FlowErrorBoundaryRef | null>;
  
  // Utility methods
  clearAllData: () => void;
  getDebugInfo: () => FlowDebugInfo;
}

// ============================================================================
// DEBUG INFO TYPE
// ============================================================================

export interface FlowDebugInfo {
  config: FlowConfig;
  user: { id: string; email?: string } | null;
  hasErrors: boolean;
  isLoading: boolean;
  timestamp: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FlowErrorHandler = (error: Error, context: string, modelName?: string) => void;
export type FlowLoadingHandler = (isLoading: boolean, modelName?: string) => void;

export interface FlowErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export type FlowErrorFallbackComponent = React.ComponentType<FlowErrorFallbackProps>;
`;

	const filePath = join(context.outputDir, "flow-context.ts");
	await writeFile(filePath, template);
}

async function generateFlowConfig(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const stateTypeFields = config.models
		.map((modelName) => {
			const lowerPluralName = plural(modelName.toLowerCase());
			return `  ${lowerPluralName}: Record<string, ${modelName}>;
  ${lowerPluralName}Loading: boolean;
  ${lowerPluralName}Error: string | null;`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// Flow configuration types and state definitions

import type React from 'react';
${config.models.map((model) => `import type { ${model} } from './${model.toLowerCase()}/types';`).join("\n")}

// ============================================================================
// FLOW CONFIGURATION
// ============================================================================

export interface FlowConfig {
  // Error handling
  errorBoundary: boolean;
  errorFallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  
  // Development tools
  devTools: boolean;
  
  // Auto-refresh configuration
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  
  // SSR/Hydration
  ssrSafe: boolean;
  
  // Performance optimizations
  batchUpdates: boolean;
  optimisticUpdates: boolean;
  
  // Custom settings
  [key: string]: any;
}

// ============================================================================
// FLOW STATE TYPE
// ============================================================================

export interface FlowState {
${stateTypeFields}
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_FLOW_CONFIG: FlowConfig = {
  errorBoundary: true,
  devTools: process.env.NODE_ENV === 'development',
  autoRefresh: false,
  refreshInterval: 30000,
  ssrSafe: true,
  batchUpdates: true,
  optimisticUpdates: true,
};

// ============================================================================
// CONFIGURATION HELPERS
// ============================================================================

export function createFlowConfig(userConfig?: Partial<FlowConfig>): FlowConfig {
  return {
    ...DEFAULT_FLOW_CONFIG,
    ...userConfig,
  };
}

export function validateFlowConfig(config: Partial<FlowConfig>): string[] {
  const errors: string[] = [];
  
  if (config.refreshInterval !== undefined && config.refreshInterval < 1000) {
    errors.push('refreshInterval must be at least 1000ms');
  }
  
  if (config.errorBoundary === false && config.errorFallback) {
    errors.push('errorFallback requires errorBoundary to be true');
  }
  
  return errors;
}

// ============================================================================
// TYPE EXPORTS FOR CONVENIENCE
// ============================================================================

export type { FlowContextValue, FlowDebugInfo, FlowErrorBoundaryRef } from './flow-context';
`;

	const filePath = join(context.outputDir, "flow-config.ts");
	await writeFile(filePath, template);
}
