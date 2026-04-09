import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function OTPVerificationScreen({ navigation, route }: any) {
  const email = route?.params?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { apiUrl } = useAuth();

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");

    if (code.length !== 5) {
      Alert.alert("Erro", "Por favor, insira o código completo de 5 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Código inválido");
      }

      // Navigate to reset password with email and resetToken
      navigation.navigate("ResetPassword", {
        email,
        resetToken: data.resetToken,
      });
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Código inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    try {
      const res = await fetch(`${apiUrl}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.status === 429) {
        Alert.alert("Aguarde", data.message);
        return;
      }

      // Reset countdown
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      Alert.alert("Sucesso", "Um novo código foi enviado para o seu email.");
    } catch (error: any) {
      Alert.alert("Erro", "Falha ao reenviar código.");
    } finally {
      setResending(false);
    }
  };

  // Mask the email for display
  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Background decorativo */}
        <View style={styles.backgroundDecoration}>
          <Image
            source={require("../../assets/Group.png")}
            style={styles.decorationImage}
            resizeMode="contain"
          />
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Steps centralizados no topo */}
        <View style={styles.stepsContainer}>
          <View style={styles.steps}>
            <View style={[styles.step, styles.stepActive]} />
            <View style={[styles.step, styles.stepActive]} />
            <View style={[styles.step, styles.stepInactive]} />
          </View>
        </View>

        {/* Conteúdo principal */}
        <View style={styles.centerContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Verificar Código</Text>
              <Text style={styles.subtitle}>
                Introduza o código OTP de 5 dígitos que enviámos para{"\n"}
                <Text style={styles.emailHighlight}>{maskedEmail}</Text>
              </Text>
            </View>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    focusedIndex === index && styles.otpInputFocused,
                    digit ? styles.otpInputFilled : null,
                  ]}
                  value={digit}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, loading && { opacity: 0.7 }]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Verificar Código</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={!canResend || resending}
            >
              {resending ? (
                <ActivityIndicator color="#22C55E" size="small" />
              ) : (
                <Text style={styles.resendText}>
                  Não recebeu o código?{" "}
                  {canResend ? (
                    <Text style={styles.resendLink}>Enviar novamente</Text>
                  ) : (
                    <Text style={styles.resendCountdown}>
                      Reenviar em {countdown}s
                    </Text>
                  )}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 8,
  },
  stepsContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  stepActive: {
    backgroundColor: "#22C55E",
  },
  stepInactive: {
    backgroundColor: "#d3d6ff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  backgroundDecoration: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    justifyContent: "flex-end",
    alignItems: "center",
    opacity: 0.05,
  },
  decorationImage: {
    width: "90%",
    height: "90%",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  header: {
    marginBottom: 40,
    width: "100%",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
  },
  emailHighlight: {
    color: "#22C55E",
    fontWeight: "600",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  otpInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 12,
    width: 54,
    height: 58,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
  },
  otpInputFocused: {
    borderColor: "#3461FD",
    backgroundColor: "#fff",
  },
  otpInputFilled: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FFF5",
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resendButton: {
    marginTop: 24,
    minHeight: 30,
    justifyContent: "center",
  },
  resendText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
  resendLink: {
    color: "#22C55E",
    fontWeight: "bold",
  },
  resendCountdown: {
    color: "#999",
    fontWeight: "600",
  },
});