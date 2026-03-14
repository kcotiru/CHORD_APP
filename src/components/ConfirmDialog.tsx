import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, TouchableWithoutFeedback, ActivityIndicator,
} from 'react-native';
import { Colors, Typography, FontSize, Spacing, Radius } from '../theme';

interface Props {
  visible:       boolean;
  title:         string;
  message:       string;
  confirmLabel?: string;
  cancelLabel?:  string;
  onConfirm:     () => void | Promise<void>;
  onCancel:      () => void;
  loading?:      boolean;
  destructive?:  boolean;
}

export default function ConfirmDialog({
  visible, title, message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  onConfirm, onCancel,
  loading = false,
  destructive = true,
}: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmBtn, destructive && styles.confirmBtnDestructive]}
                  onPress={onConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.confirmText}>{confirmLabel}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  sheet: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderBright,
  },
  title: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  message: {
    fontFamily: Typography.uiFamily,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Typography.uiMediumFamily,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  confirmBtnDestructive: { backgroundColor: Colors.error },
  confirmText: {
    fontFamily: Typography.uiBoldFamily,
    fontSize: FontSize.md,
    color: '#fff',
  },
});
