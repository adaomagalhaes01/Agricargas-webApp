import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();

  useEffect(() => {
    // Animação de fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Após 3 segundos, navega para a tela apropriada
    const timer = setTimeout(() => {
      if (user?.onboarding_completed === 1) {
        navigation.replace("MainMenu");
      } else {
        navigation.replace("WhoUsing");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation, user]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/agrilogo.png")}
        style={[styles.logo, { opacity: fadeAnim }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
});
