import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import MainMenuScreen from "../screens/MainMenuScreen";
import PurchaseHistoryScreen from "../screens/PurchaseHistoryScreen";
import CartScreen from "../screens/CardScreen";
import ProfileScreen from "../screens/profileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
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
                                <View style={styles.cartBadge}>
                                    <Text style={styles.cartBadgeText}>3</Text>
                                </View>
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
                options={{ tabBarLabel: "Home" }}
            />
            <Tab.Screen
                name="HistoryTab"
                component={PurchaseHistoryScreen}
                options={{ tabBarLabel: "Histórico" }}
            />
            <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{ tabBarLabel: "Carrinho" }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ tabBarLabel: "Perfil" }}
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
