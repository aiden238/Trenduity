import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useA11y } from '../contexts/A11yContext';
import { useReactions, useToggleReaction, TargetType, ReactionKind } from '../hooks/useReactions';

interface ReactionButtonsProps {
  targetType: TargetType;
  targetId: string;
}

const REACTION_CONFIG: Record<ReactionKind, { label: string; icon: string }> = {
  cheer: { label: '응원해요', icon: '👏' },
  useful: { label: '도움됐어요', icon: '💡' },
  like: { label: '좋아요', icon: '❤️' },
};

export function ReactionButtons({ targetType, targetId }: ReactionButtonsProps) {
  const { data: reactions } = useReactions(targetType, targetId);
  const toggleMutation = useToggleReaction();
  const { spacing, fontSizes } = useA11y();

  const handleReaction = (kind: ReactionKind) => {
    toggleMutation.mutate({ target_type: targetType, target_id: targetId, kind });
  };

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      {Object.entries(REACTION_CONFIG).map(([kind, config]) => {
        const reactionData = reactions?.[kind];
        const isActive = reactionData?.user_reacted || false;
        const count = reactionData?.count || 0;

        return (
          <Pressable
            key={kind}
            style={[
              styles.button,
              {
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: spacing.md,
              },
              isActive && styles.buttonActive,
            ]}
            onPress={() => handleReaction(kind as ReactionKind)}
            accessibilityRole="button"
            accessibilityLabel={`${config.label} ${count > 0 ? `(${count}명)` : ''}`}
          >
            <Text
              style={[
                styles.buttonText,
                { fontSize: fontSizes.md },
                isActive && styles.buttonTextActive,
              ]}
            >
              {config.icon} {config.label} {count > 0 && `(${count})`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  buttonText: {
    color: '#666',
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
