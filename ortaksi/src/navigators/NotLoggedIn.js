import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import CustomerLogin from '../screens/customer/Login';
import CustomerRegister from '../screens/customer/Register';
import DriverLogin from '../screens/driver/Login';
import DriverRegister from '../screens/driver/Register';
import Landing from '../screens/Landing';

/*
    stack navigator:
        başka sayfaya geçildiğinde o sayfa ekranda en öne koyuluyor, geri tuşuna basıldığında önceki sayfalara gidilebiliyor
        bunu sağlayan şey stack navigator
*/
const Stack = createStackNavigator();

// eğer giriş yapmış kullanıcı yoksa bu sayfalar arasında gezilebileceğini belirten komponent
export default function NotLoggedInNavigator() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown: false // yukarda sayfa başlığı gözüksün mü
        }}>
            <Stack.Screen
                name="Landing" // kullanıcı giriş / müşteri giriş seçim sayfası
                component={Landing} // sayfanın komponenti
            />
            <Stack.Screen
                name="Customer Login" // müşteri giriş sayfası
                component={CustomerLogin} // sayfanın komponenti
            />
            <Stack.Screen
                name="Customer Register" // müşteri kayıt sayfası
                component={CustomerRegister} // sayfanın komponenti
            />
            <Stack.Screen
                name="Driver Login" // şoför giriş
                component={DriverLogin} // sayfanın komponenti
            />
            <Stack.Screen
                name="Driver Register" // şoför kayıt
                component={DriverRegister} // sayfanın komponenti
            />
        </Stack.Navigator>
    );
}