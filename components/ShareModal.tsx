import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { Text, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Kural } from '../types/kural';
import { useSettingsStore } from '../store/useSettingsStore';
import { SheetModal } from './SheetModal';
import { FitLines } from './FitLines';
import { useAppTheme, useType, space, radius } from '../theme';

interface ShareModalProps {
  visible: boolean;
  onDismiss: () => void;
  kural: Kural;
}

// Card styles for the shared image, drawn from the app's own palettes
const THEMES = [
  { id: 'paper', name: 'Paper', colors: ['#FFFDF8', '#F5EFE3'] as const, textColor: '#221A12', subTextColor: '#7A6B5B' },
  { id: 'palm', name: 'Palm leaf', colors: ['#F1E3C2', '#E1C995'] as const, textColor: '#33230F', subTextColor: '#6E5432' },
  { id: 'ink', name: 'Ink', colors: ['#211E1A', '#121110'] as const, textColor: '#F3ECDF', subTextColor: '#B5AB9C' },
  { id: 'indigo', name: 'Indigo', colors: ['#24539F', '#132E63'] as const, textColor: '#FFFFFF', subTextColor: '#C9D6F0' },
  { id: 'kumkum', name: 'Kumkum', colors: ['#963232', '#5A1A1A'] as const, textColor: '#FFF6F2', subTextColor: '#F0C8C0' },
  { id: 'leaf', name: 'Leaf', colors: ['#356F3F', '#1D4425'] as const, textColor: '#F4FBF2', subTextColor: '#C4E0C2' },
];

export const buildShareText = (
  kural: Kural,
  options: { tamil: boolean; english: boolean; explanation: boolean }
) => {
  let message = `Thirukkural #${kural.number}`;
  if (options.tamil) message += `\n\n${kural.line1}\n${kural.line2}`;
  if (options.english) message += `\n\n${kural.eng}`;
  if (options.explanation) {
    if (options.tamil) message += `\n\nபொருள்:\n${kural.tam_exp}`;
    if (options.english) message += `\n\nMeaning:\n${kural.eng_exp}`;
  }
  return message;
};

export const ShareModal: React.FC<ShareModalProps> = ({ visible, onDismiss, kural }) => {
  const theme = useAppTheme();
  const selectedChip = { backgroundColor: theme.colors.secondaryContainer };
  const type = useType();
  const {
    shareIncludeTamil, shareIncludeEnglish, shareIncludeExplanation,
    toggleShareIncludeTamil, toggleShareIncludeEnglish, toggleShareIncludeExplanation,
  } = useSettingsStore();
  const [selectedThemeId, setSelectedThemeId] = useState('paper');
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewRef = useRef<View>(null);

  const selectedTheme = THEMES.find((t) => t.id === selectedThemeId) ?? THEMES[0];
  const options = { tamil: shareIncludeTamil, english: shareIncludeEnglish, explanation: shareIncludeExplanation };

  const handleShareImage = async () => {
    setError(null);
    setSharing(true);
    try {
      const uri = await captureRef(viewRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: `Thirukkural #${kural.number}` });
      } else {
        setError('Image sharing is not available on this device. Try sharing as text.');
      }
    } catch (e) {
      console.error('Image share failed', e);
      setError('Could not create the image. Try sharing as text.');
    } finally {
      setSharing(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await Clipboard.setStringAsync(buildShareText(kural, options));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareText = async () => {
    setError(null);
    try {
      await Share.share({ message: buildShareText(kural, options) });
    } catch (e) {
      console.error('Text share failed', e);
    }
  };

  // Keep at least one language selected so the share is never empty
  const onToggleTamil = () => { if (shareIncludeEnglish || !shareIncludeTamil) toggleShareIncludeTamil(); };
  const onToggleEnglish = () => { if (shareIncludeTamil || !shareIncludeEnglish) toggleShareIncludeEnglish(); };

  return (
    <SheetModal visible={visible} onClose={onDismiss} title="Share Kural" scrollable={false}>
      <ScrollView style={styles.contentScroll}>
        {/* The image that gets shared */}
        <View style={[styles.previewContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            ref={viewRef}
            collapsable={false}
            style={[styles.cardWrapper, !shareIncludeExplanation && styles.cardWrapperFixed]}
          >
            <LinearGradient
              colors={selectedTheme.colors}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Text style={[type.uiStrong, styles.kuralNumber, { color: selectedTheme.subTextColor }]}>
                  Kural {kural.number}
                </Text>
                <Text style={[type.tamilLabel, styles.chapter, { color: selectedTheme.subTextColor }]} numberOfLines={1}>
                  {shareIncludeTamil ? kural.chap_tam : kural.chap_eng ?? kural.chap_tam}
                </Text>
              </View>

              {shareIncludeTamil && (
                <View style={styles.textContainer}>
                  {/* Always the original two lines; the size adapts to the longer line */}
                  <FitLines
                    lines={[kural.line1, kural.line2]}
                    maxSize={20}
                    minSize={12}
                    align="center"
                    gap={0.25}
                    styleAt={(size) => ({ ...type.kural(size), color: selectedTheme.textColor })}
                  />
                </View>
              )}

              {shareIncludeTamil && shareIncludeEnglish && (
                <View style={[styles.divider, { backgroundColor: selectedTheme.subTextColor, opacity: 0.3 }]} />
              )}

              {shareIncludeEnglish && (
                <Text style={[type.translation, styles.englishText, { color: selectedTheme.textColor }]}>
                  {kural.eng}
                </Text>
              )}

              {shareIncludeExplanation && (
                <View style={styles.explanation}>
                  {shareIncludeTamil && (
                    <Text style={[type.tamilBody, styles.explanationText, { color: selectedTheme.textColor }]}>
                      {kural.tam_exp}
                    </Text>
                  )}
                  {shareIncludeEnglish && (
                    <Text style={[type.englishBody, styles.explanationText, { color: selectedTheme.textColor }]}>
                      {kural.eng_exp}
                    </Text>
                  )}
                </View>
              )}

              <Text style={[styles.footer, { color: selectedTheme.subTextColor }]}>
                Kural Daily · திருக்குறள்
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Remembered for next time */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Include</Text>
        <View style={styles.optionRow}>
          <Chip mode="outlined" selected={shareIncludeTamil} showSelectedCheck onPress={onToggleTamil} style={[styles.optionChip, shareIncludeTamil && selectedChip]}>
            Tamil
          </Chip>
          <Chip mode="outlined" selected={shareIncludeEnglish} showSelectedCheck onPress={onToggleEnglish} style={[styles.optionChip, shareIncludeEnglish && selectedChip]}>
            English
          </Chip>
          <Chip mode="outlined" selected={shareIncludeExplanation} showSelectedCheck onPress={toggleShareIncludeExplanation} style={[styles.optionChip, shareIncludeExplanation && selectedChip]}>
            Meaning
          </Chip>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeSelector}>
          {THEMES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setSelectedThemeId(t.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedThemeId === t.id }}
              accessibilityLabel={`${t.name} style`}
              style={[
                styles.themeOption,
                { borderColor: selectedThemeId === t.id ? theme.colors.primary : 'transparent' },
              ]}
            >
              <LinearGradient
                colors={t.colors}
                style={styles.themePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text variant="labelSmall" style={styles.themeName}>{t.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: theme.colors.outlineVariant }]}>
        {error && (
          <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
        <Button
          mode="contained"
          icon="image-outline"
          onPress={handleShareImage}
          loading={sharing}
          disabled={sharing}
          style={styles.shareButton}
        >
          Share image
        </Button>
        <View style={styles.textActions}>
          <Button mode="outlined" icon="text" onPress={handleShareText} style={styles.flex}>
            Share text
          </Button>
          <Button mode="outlined" icon={copied ? 'check' : 'content-copy'} onPress={handleCopy} style={styles.flex}>
            {copied ? 'Copied' : 'Copy text'}
          </Button>
        </View>
      </View>
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  contentScroll: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  textActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  previewContainer: {
    padding: space.xl,
    alignItems: 'center',
  },
  // The only shadow in the app: the preview is a picture of a card (design.md)
  cardWrapper: {
    width: '100%',
    maxWidth: 320,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardWrapperFixed: {
    aspectRatio: 4 / 5,
    minHeight: undefined,
  },
  card: {
    flex: 1,
    padding: 24,
    paddingHorizontal: 18,
    paddingBottom: 48,
    borderRadius: 16,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  kuralNumber: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chapter: {
    fontSize: 14,
    flexShrink: 1,
  },
  textContainer: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    width: '40%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  englishText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  explanation: {
    marginTop: 20,
    gap: 10,
  },
  explanationText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    fontSize: 12,
    opacity: 0.8,
  },
  sectionTitle: {
    paddingHorizontal: space.xl,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: space.lg,
    gap: space.sm,
  },
  optionChip: {
    marginRight: 0,
  },
  themeSelector: {
    paddingHorizontal: space.lg,
    marginBottom: space.xl,
  },
  themeOption: {
    marginRight: space.md,
    borderRadius: radius.sm + 2,
    borderWidth: 2,
    padding: 2,
  },
  themePreview: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
  },
  themeName: {
    textAlign: 'center',
    marginTop: space.xs,
  },
  actions: {
    padding: space.lg,
    gap: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  error: {
    textAlign: 'center',
    marginBottom: space.sm,
  },
  shareButton: {
    paddingVertical: 2,
  },
});
