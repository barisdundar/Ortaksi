import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import CustomDrawer from '../components/CustomDrawer';
import Contacts from '../screens/Contact';
import Main from '../screens/driver/Main';
import SSS from '../screens/Sss';

// yandan çıkan menüyü sağlayan navigator
const Drawer = createDrawerNavigator();

// şoför giriş yaptığında gezebileceği sayfaları burda oluşturuyoruz
export default function DriverLoggedInNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Main" // ilk başlanacak sayfanın adı Main
            drawerPosition="right" // sağdan çekince çıkacak arayüz onu belirttik
            drawerContent={(props) => <CustomDrawer {...props} />} // sağdan çıkan arayüzün içeriğini oluşturan komponenti verdik
        >
            <Drawer.Screen
                name="Main" // şoförün ana sayfasının adı
                component={Main} // şoförün ana sayfasının komponenti
            />
            <Drawer.Screen
                name="SSS" // sıkça sorulan sorular
                component={SSS}
            />
            <Drawer.Screen
                name="İletişim" // iletişim
                component={Contacts}
            />
        </Drawer.Navigator>
    );
}