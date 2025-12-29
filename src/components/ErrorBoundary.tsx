import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary);
      }

      return (
        <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-4">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="mt-4 text-lg font-semibold text-gray-900 dark:text-white text-center">
            Something went wrong
          </Text>
          <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            {this.state.error.message}
          </Text>
          <TouchableOpacity
            onPress={this.resetErrorBoundary}
            className="mt-6 bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
