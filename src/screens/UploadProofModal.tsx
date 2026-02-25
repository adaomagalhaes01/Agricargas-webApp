import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";

type ModalStep = "upload" | "processing" | "confirmed";

interface UploadProofModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (file: any) => void;
}

export default function UploadProofModal({
  visible,
  onClose,
  onConfirm,
}: UploadProofModalProps) {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [step, setStep] = useState<ModalStep>("upload");
  const { t } = useTranslation();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setStep("upload");
      setSelectedFile(null);
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Spin animation for processing
  useEffect(() => {
    if (step === "processing") {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();

      // After 3 seconds, move to confirmed
      const timer = setTimeout(() => {
        spin.stop();
        setStep("confirmed");
      }, 3000);

      return () => {
        spin.stop();
        clearTimeout(timer);
      };
    }
  }, [step]);

  // Success animation
  useEffect(() => {
    if (step === "confirmed") {
      spinAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [step]);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Erro ao selecionar arquivo:", error);
      Alert.alert(t("error"), t("selectProofFirst"));
    }
  };

  const handleSend = () => {
    if (!selectedFile) {
      Alert.alert(t("attention"), t("selectProofFirst"));
      return;
    }
    setStep("processing");
  };

  const handleFinish = () => {
    onConfirm(selectedFile);
    setSelectedFile(null);
    setStep("upload");
  };

  const handleClose = () => {
    setSelectedFile(null);
    setStep("upload");
    onClose();
  };

  // Helper to get file icon based on type
  const getFileIcon = () => {
    if (!selectedFile) return null;
    const name = selectedFile.name?.toLowerCase() || "";
    if (name.endsWith(".pdf")) {
      return "document-text";
    }
    return "image";
  };

  const getFileSize = () => {
    if (!selectedFile?.size) return "";
    const sizeKB = (selectedFile.size / 1024).toFixed(1);
    return `${sizeKB} KB`;
  };

  // ── RENDER: Upload Step ──
  const renderUploadStep = () => (
    <>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="document-text-outline" size={50} color="#22C55E" />
      </View>

      {/* Title */}
      <Text style={styles.title}>{t("sendProof")}</Text>

      {/* Description */}
      <Text style={styles.description}>
        {t("proofDescription")}
      </Text>

      {/* Upload Area */}
      <TouchableOpacity
        style={[
          styles.uploadArea,
          selectedFile && styles.uploadAreaSelected,
        ]}
        onPress={pickDocument}
        activeOpacity={0.7}
      >
        {selectedFile ? (
          <>
            <View style={styles.fileSelectedIcon}>
              <Ionicons
                name={getFileIcon() as any}
                size={30}
                color="#22C55E"
              />
            </View>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            {getFileSize() ? (
              <Text style={styles.fileSize}>{getFileSize()}</Text>
            ) : null}
            <View style={styles.fileStatusRow}>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={styles.fileStatusText}>{t("fileSelected")}</Text>
            </View>
            <TouchableOpacity
              style={styles.changeFileBtn}
              onPress={pickDocument}
            >
              <Ionicons name="swap-horizontal-outline" size={14} color="#22C55E" />
              <Text style={styles.changeFileText}>{t("changeFile")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.uploadIconCircle}>
              <Ionicons name="cloud-upload-outline" size={36} color="#bbb" />
            </View>
            <Text style={styles.uploadMainText}>
              {t("tapToSelect")}
            </Text>
            <Text style={styles.uploadSubText}>{t("pdfOrImage")}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Send Button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          !selectedFile && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        activeOpacity={0.85}
        disabled={!selectedFile}
      >
        <Ionicons name="send-outline" size={18} color="#fff" />
        <Text style={styles.sendButtonText}>{t("sendProofBtn")}</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
        <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
      </TouchableOpacity>
    </>
  );

  // ── RENDER: Processing Step ──
  const renderProcessingStep = () => (
    <>
      {/* Spinning icon */}
      <Animated.View
        style={[
          styles.processingIconContainer,
          { transform: [{ rotate: spinInterpolation }] },
        ]}
      >
        <Ionicons name="sync-outline" size={56} color="#22C55E" />
      </Animated.View>

      <Text style={styles.processingTitle}>{t("analyzing")}</Text>

      <Text style={styles.processingDescription}>
        {t("analyzingDescription")}
      </Text>

      {/* Progress dots animation */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>
    </>
  );

  // ── RENDER: Confirmed Step ──
  const renderConfirmedStep = () => (
    <>
      {/* Success icon with animation */}
      <Animated.View
        style={[
          styles.confirmedIconContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
      </Animated.View>

      <Animated.Text style={[styles.confirmedTitle, { opacity: fadeAnim }]}>
        {t("paymentConfirmed")}
      </Animated.Text>

      <Animated.Text style={[styles.confirmedDescription, { opacity: fadeAnim }]}>
        {t("paymentConfirmedDescription")}
      </Animated.Text>

      {/* Finish Button */}
      <Animated.View style={{ opacity: fadeAnim, width: "100%" }}>
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
          activeOpacity={0.85}
        >
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={styles.finishButtonText}>{t("finish")}</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={step === "processing" ? undefined : handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {step === "upload" && renderUploadStep()}
          {step === "processing" && renderProcessingStep()}
          {step === "confirmed" && renderConfirmedStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 26,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // ── Upload Step ──
  iconContainer: {
    width: 90,
    height: 90,
    backgroundColor: "#E8F8F0",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  uploadArea: {
    width: "100%",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    backgroundColor: "#F9FAFB",
  },
  uploadAreaSelected: {
    borderColor: "#22C55E",
    borderStyle: "solid",
    backgroundColor: "#F0FFF5",
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadMainText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
  },
  uploadSubText: {
    fontSize: 12,
    color: "#bbb",
    marginTop: 4,
  },
  fileSelectedIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D4F4E7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
    maxWidth: "90%",
  },
  fileSize: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  fileStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  fileStatusText: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "600",
  },
  changeFileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  changeFileText: {
    fontSize: 12,
    color: "#22C55E",
    fontWeight: "500",
  },
  sendButton: {
    flexDirection: "row",
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Processing Step ──
  processingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  processingDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
  dotActive: {
    backgroundColor: "#22C55E",
  },

  confirmedIconContainer: {
    marginBottom: 16,
    marginTop: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  confirmedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#22C55E",
    marginBottom: 10,
    textAlign: "center",
    alignSelf: "center",
  },
  confirmedDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  finishButton: {
    flexDirection: "row",
    backgroundColor: "#22C55E",
    borderRadius: 10,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});