import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';
import type { SectionWithBars } from '../types';

interface Props {
  sections:      SectionWithBars[];
  chordFontSize: number;            // Driven by settingsStore
}

export default function ChordSheet({ sections, chordFontSize }: Props) {
  if (!sections.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No chord data yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} chordFontSize={chordFontSize} />
      ))}
    </View>
  );
}

// ── Section block ─────────────────────────────────────────────────────────────

function SectionBlock({
  section,
  chordFontSize,
}: {
  section: SectionWithBars;
  chordFontSize: number;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionLabel}>{section.name.toUpperCase()}</Text>
      </View>

      <View style={styles.barsGrid}>
        {section.bars.map((bar, idx) => (
          <React.Fragment key={bar.id}>
            {bar.starts_new_line && idx !== 0 && (
              <View style={styles.lineBreak} />
            )}
            <BarCell bar={bar} chordFontSize={chordFontSize} />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// ── Bar cell ──────────────────────────────────────────────────────────────────

function BarCell({
  bar,
  chordFontSize,
}: {
  bar: SectionWithBars['bars'][number];
  chordFontSize: number;
}) {
  const chords = bar.chords ?? [];

  return (
    <View style={styles.barCell}>
      {/* Left barline */}
      <View style={styles.barline} />

      <View style={styles.barContent}>
        {chords.length === 0 ? (
          <Text style={[styles.chordToken, { fontSize: chordFontSize, color: Colors.textMuted }]}>
            %
          </Text>
        ) : (
          chords.map((chord, i) => (
            <Text
              key={`${chord}-${i}`}
              style={[styles.chordToken, { fontSize: chordFontSize }]}
            >
              {chord}
            </Text>
          ))
        )}

        {bar.repeat_count > 1 && (
          <Text style={[styles.repeatBadge, { fontSize: chordFontSize - 5 }]}>
            ×{bar.repeat_count}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:  { paddingBottom: Spacing.xxxl },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyText: { fontFamily: Typography.uiFamily, fontSize: FontSize.md, color: Colors.textMuted },

  // ── Section ─────────────────────────────────────────────────────────────────
  section:      { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionAccent: {
    width: 3, height: 18,
    backgroundColor: Colors.section,
    borderRadius: Radius.full,
  },
  sectionLabel: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.xs,
    color: Colors.section,
    letterSpacing: 2,
  },

  // ── Bars grid ────────────────────────────────────────────────────────────────
  barsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  lineBreak: { width: '100%', height: 0 },

  // ── Bar cell ─────────────────────────────────────────────────────────────────
  barCell: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 80,
    paddingRight: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  barline: {
    width: 2,
    backgroundColor: Colors.border,
    marginRight: Spacing.sm,
    borderRadius: 1,
  },
  barContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  chordToken: {
    fontFamily: Typography.chordBoldFamily,
    color: Colors.chord,
    letterSpacing: 0.5,
  },
  repeatBadge: {
    fontFamily: Typography.chordFamily,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
  },
});
