import React from 'react';
import { Text } from 'react-native';
import { theme } from '../../../theme';

const HighlightedText = ({ text, searchTerm, style, highlightStyle }) => {
  if (!searchTerm || searchTerm.length < 2) {
    return <Text style={style}>{text}</Text>;
  }

  // Escapar caracteres especiais do regex
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        const isHighlight = regex.test(part);
        return (
          <Text
            key={index}
            style={isHighlight ? [
              {
                backgroundColor: theme.colors.primaryContainer,
                color: theme.colors.onPrimaryContainer,
                fontWeight: theme.typography.weights.medium,
              },
              highlightStyle
            ] : null}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

export default HighlightedText;
