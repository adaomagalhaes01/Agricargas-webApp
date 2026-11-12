import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import MainMenuScreen from "../screens/MainMenuScreen";
import PurchaseHistoryScreen from "../screens/PurchaseHistoryScreen";
import CartScreen from "../screens/CardScreen";
import ProfileScreen from "../screens/profileScreen";

import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
    const { totalItems } = useCart();
    const { t } = useTranslation();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "#22C55E",
                tabBarInactiveTintColor: "#999",
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "600",
                    marginTop: -2,
                },
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                    paddingTop: 6,
                    paddingBottom: 6,
                    height: 60,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === "HomeTab") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "HistoryTab") {
                        iconName = focused ? "receipt" : "receipt-outline";
                    } else if (route.name === "CartTab") {
                        iconName = focused ? "cart" : "cart-outline";
                    } else if (route.name === "ProfileTab") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    if (route.name === "CartTab") {
                        return (
                            <View>
                                <Ionicons name={iconName} size={22} color={color} />
                                {totalItems > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{totalItems}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    }

                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={MainMenuScreen}
                options={{ tabBarLabel: t("homeTab") }}
            />
            <Tab.Screen
                name="HistoryTab"
                component={PurchaseHistoryScreen}
                options={{ tabBarLabel: t("historyTab") }}
            />
            <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{ tabBarLabel: t("cartTab") }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ tabBarLabel: t("profileTab") }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    cartBadge: {
        position: "absolute",
        right: -8,
        top: -4,
        backgroundColor: "#22C55E",
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    cartBadgeText: {
        color: "#fff",
        fontSize: 9,
        fontWeight: "bold",
    },
});
