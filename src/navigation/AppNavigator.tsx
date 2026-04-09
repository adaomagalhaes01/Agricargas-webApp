import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// Importação das telas
import CodeVerificationScreen from "../screens/CodeVerificationScreen";
import LoginScreen from "../screens/loginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import RegisterScreen from "../screens/RegisterScreen";
import OTPVerificationScreen from "../screens/OTPVerificationScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import TermsAndPrivacyScreen from "../screens/TermsAndPrivacyScreen";
import SplashScreen from "../screens/SplashScreen";
import WhoUsingScreen from "../screens/WhoUsingScreen";
import ChooseProfileScreen from "../screens/ChooseProfileScreen";
import CompanyNIFScreen from "../screens/CompanyNIFScreen";
import VendorNIFScreen from "../screens/VendorNIFScreen";
import NextStepScreen from "../screens/NextStepScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ValidateProviderScreen from "../screens/ValidateProviderScreen";
import HelpScreen from "../screens/HelpScreen";
import BottomTabNavigator from "./BottomTabNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // 🚀 Fluxo principal (Autenticado)
          <>
            <Stack.Screen name="SplashScreen" component={SplashScreen} />
            <Stack.Screen name="WhoUsing" component={WhoUsingScreen} />
            <Stack.Screen name="ChooseProfile" component={ChooseProfileScreen} />
            <Stack.Screen name="CompanyNIF" component={CompanyNIFScreen} />
            <Stack.Screen name="VendorNIF" component={VendorNIFScreen} />
            <Stack.Screen name="NextStep" component={NextStepScreen} />
            <Stack.Screen name="MainMenu" component={BottomTabNavigator} />

            {/* 📋 Telas sem Tab Bar (stack screens) */}
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="ValidateProvider" component={ValidateProviderScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
          </>
        ) : (
          // 🔐 Fluxo de autenticação (Não Autenticado)
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
            <Stack.Screen name="CodeVerification" component={CodeVerificationScreen} />
            <Stack.Screen name="TermsAndPrivacy" component={TermsAndPrivacyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}