import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@core/theme';
import { Button } from '@core/components/Button';

/**
 * SignInScreen — Google Sign-In placeholder.
 * In production: wire @react-native-firebase/auth + @react-native-google-signin/google-signin.
 * The store/auth integration follows the same MVI dispatch pattern as other stores.
 */
export function SignInScreen() {
  const router = useRouter();

  const handleGoogleSignIn = () => {
    // TODO: Integrate @react-native-firebase/auth
    // dispatch({ type: 'SIGN_IN_WITH_GOOGLE' });
    // For now, navigate directly to the app
    router.replace('/(tabs)/');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/');
  };

  return (
    <View style={styles.container}>
      {/* Logo / Branding */}
      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>📒</Text>
        </View>
        <Text style={styles.appName}>Ledger</Text>
        <Text style={styles.tagline}>Personal Finance, Simplified</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} activeOpacity={0.85}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleLabel}>Continue with Google</Text>
        </TouchableOpacity>

        <Button
          label="Continue without account"
          variant="ghost"
          onPress={handleSkip}
          style={styles.skipButton}
        />

        <Text style={styles.disclaimer}>
          Your data is stored locally on this device. Sign in enables cloud backup.
        </Text>
      </View>
    </View>
  );
}

const FEATURES = [
  { icon: '💳', title: 'Multi-account tracking', desc: 'Manage checking, savings, and cash in any currency' },
  { icon: '📊', title: 'Visual analytics', desc: 'Income vs expense charts and category breakdowns' },
  { icon: '☁️', title: 'Cloud backup', desc: 'Secure your data with Google Drive backup' },
  { icon: '🔒', title: 'Biometric security', desc: 'Protect your finances with Face ID or fingerprint' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.xl, justifyContent: 'space-between' },
  hero: { alignItems: 'center', paddingTop: Spacing['3xl'] },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  logoIcon: { fontSize: 40 },
  appName: { ...Typography.displayLarge, color: Colors.text.primary },
  tagline: { ...Typography.bodyLarge, color: Colors.text.secondary, marginTop: Spacing.xs },
  features: { gap: Spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.base },
  featureIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  featureTitle: { ...Typography.titleMedium, color: Colors.text.primary },
  featureDesc: { ...Typography.bodySmall, color: Colors.text.secondary },
  actions: { gap: Spacing.md },
  googleButton: {
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  googleIcon: { ...Typography.headlineSmall, color: Colors.expense, fontWeight: '700' },
  googleLabel: { ...Typography.labelLarge, color: Colors.text.primary },
  skipButton: { height: 44 },
  disclaimer: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
