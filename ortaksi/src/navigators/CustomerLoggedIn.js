import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import CustomDrawer from '../components/CustomDrawer';
import Main from '../screens/customer/Main';
import SSS from '../screens/Sss';
import Contacts from '../screens/Contact';

// yandan çıkan menüyü sağlayan navigator
const Drawer = createDrawerNavigator();

// müşteri giriş yaptığında gezebileceği sayfaları burda oluşturuyoruz
export default function CustomerLoggedInNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Main" // ilk başlanacak sayfanın adı Main
            drawerPosition="right" // sağdan çekince çıkacak arayüz onu belirttik
            drawerContent={(props) => <CustomDrawer {...props} />} // sağdan çıkan arayüzün içeriğini oluşturan komponenti verdik
        >
            <Drawer.Screen
                name="Main" // müşterinin ana sayfasının adı
                component={Main} // müşterinin ana sayfasının komponenti
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