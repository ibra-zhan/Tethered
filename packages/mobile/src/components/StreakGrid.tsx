import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface StreakGridProps {
  data: boolean[]; // true = filled, false = empty
  accentColor: string;
  size?: 'small' | 'large';
}

export default function StreakGrid({ data, accentColor, size = 'small' }: StreakGridProps) {
  // Display as 3 rows x 7 columns for large (21 days = 3 weeks)
  // Display as 6 rows x 7 columns for small (42 days = 6 weeks)
  const rows = size === 'large' ? 3 : 6;
  const cols = 7;
  const squareSize = size === 'large' ? 20 : 8;
  const gap = size === 'large' ? 8 : 1;

  // For large size, show only the last 21 days; for small, last 42 days
  const daysToShow = size === 'large' ? 21 : 42;
  const displayData = data.slice(-daysToShow);

  // Find today's index (last filled day)
  const todayIndex = displayData.lastIndexOf(true);

  return (
    <View style={[styles.container, { gap }]}>
      {Array.from({ length: cols }).map((_, colIndex) => (
        <View key={colIndex} style={[styles.column, { gap }]}>
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const index = rowIndex * cols + colIndex;
            const isFilled = displayData[index];
            const isToday = index === todayIndex;

            return (
              <View
                key={rowIndex}
                style={[
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    borderRadius: size === 'large' ? 6 : 2,
                    backgroundColor: isFilled ? accentColor : '#E5E5E5',
                  },
                  isToday && size === 'large' && {
                    borderWidth: 2,
                    borderColor: accentColor,
                    shadowColor: accentColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 5,
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  square: {
    // Dynamic styles applied inline
  },
});
