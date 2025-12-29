import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface PlayerBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  progress?: number;
  duration?: number;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
}

export function PlayerBar({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  progress = 0,
  duration = 100,
  speed = 1.0,
  onSpeedChange,
}: PlayerBarProps) {
  const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
  const currentSpeedIndex = speeds.indexOf(speed);

  const cycleSpeed = () => {
    const nextIndex = (currentSpeedIndex + 1) % speeds.length;
    if (onSpeedChange) onSpeedChange(speeds[nextIndex]);
  };

  return (
    <View className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3">
      {/* Progress Bar */}
      <View className="mb-2">
        <Slider
          value={progress}
          minimumValue={0}
          maximumValue={duration}
          minimumTrackTintColor="#0ea5e9"
          maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#0ea5e9"
          style={{ width: '100%', height: 40 }}
        />
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-between">
        {/* Speed Control */}
        <TouchableOpacity
          onPress={cycleSpeed}
          className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full"
        >
          <Text className="text-gray-900 dark:text-white font-semibold text-sm">
            {speed}x
          </Text>
        </TouchableOpacity>

        {/* Playback Controls */}
        <View className="flex-row items-center space-x-6">
          <TouchableOpacity onPress={onSkipBack} className="p-2">
            <Ionicons name="play-skip-back" size={28} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPlayPause}
            className="bg-primary-500 rounded-full p-4"
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSkipForward} className="p-2">
            <Ionicons name="play-skip-forward" size={28} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Placeholder for balance */}
        <View style={{ width: 60 }} />
      </View>
    </View>
  );
}
