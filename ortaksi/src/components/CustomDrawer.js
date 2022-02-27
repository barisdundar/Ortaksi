import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import DefaultButton from './DefaultButton';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import useIsMounted from '../useIsMounted';


// yer aramanın yanındaki butona basınca sağdan çıkan menü
// kullanıcının bilgilerini, sıkça sorulan sorular sayfasını, iletişim sayfasını ve çıkış butonunu içeriyor
export default function CustomDrawer({ navigation }) {
    const isMounted = useIsMounted(); // komponent ekranda varmı yokmu ona ulaşmak için, yokken işlem yapınca hata oluşmaması için
    const [userInfo, setUserInfo] = useState({ // şuan giriş yapmış kullanıcının bilgileri
        name: 'İSİM YÜKLENİYOR', // ilk başta yükleniyor yapıyoruz
        phone: 'TELEFON YÜKLENİYOR' // ilk başta yükleniyor yapıyoruz
    });
    const [user, setUser] = useState(); // aktif olarak giriş yapmış kullanıcı

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged((user) => { // eğer kullanıcı değişirse diye takip ediyoruz
            if (!isMounted.current) return; // eğer bu komponent ekranda varsa

            if (user != null) {
                setUser(user); // kullanıcı değiştiğnide kullanıcı null değilse değiştiriyoruz kullanıcıyı
            }
        });
        return subscriber; // komponent ekrandan kaldırırken kullanıcı değişirse diye takip ettiğimiz şeyi yok ediyoruz artık gerek yok
    }, []);

    // user değeri yani aktif olarak giriş yapmış kullanıcı değiştiğinde çağrılıyor (aşağıdaki [user] den dolayı)
    useEffect(() => {
        if (user) {
            const subscriber = firestore() // veritabanında
                .collection('users') // kullanıcılar koleksiyonundaki
                .doc(user.uid) // aktif olarak giriş yapmış kullanıcıya
                .onSnapshot( // herhangi bi değişiklik olduğunda verisinde
                    (doc) => {
                        if (isMounted.current) {
                            setUserInfo(doc.data()); // biz de o değişikliği alıp userInfo statesine kaydediyoruz
                        }
                    }
                );

            return subscriber; // komponent ekrandan kaldırırken veritabanında kullanıcıya olacak değişikliklere abone olduğumuz şeyi yok ediyoruz artık gerek yok
        }
    }, [user]);

    return (
        <View style={styles.mainContainer}>
            <ScrollView>
                <SafeAreaView>
                    <View style={styles.avatarAndInfo}>
                        <View style={{ backgroundColor: '#000', width: 64, height: 64 }}>

                        </View>
                        <View style={styles.namePhoneContainer}>
                            <Text>{userInfo.name}</Text>
                            <Text>{userInfo.phone}</Text>
                        </View>
                    </View>
                    <View style={{ margin: 8 }}>
                        <DefaultButton style={{ width: '100%' }} onPress={() => {
                            navigation.navigate('SSS')
                        }}>S.S.S.</DefaultButton>
                        <DefaultButton style={{ width: '100%', marginTop: 8 }} onPress={() => {
                            navigation.navigate('İletişim')
                        }}>İletişim</DefaultButton>
                    </View>
                </SafeAreaView>
            </ScrollView>
            <DefaultButton style={{ width: '100%' }} onPress={() => {
                // çıkış yap butonuna tıklandığında çıkış yapıyoruz
                auth().signOut().then(() => {
                    Alert.alert('Başarılı', 'Çıkış yaptınız!');
                })
            }}>ÇIKIŞ YAP</DefaultButton>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, // içinde olduğu komponenti doldur
    },
    namePhoneContainer: {
        marginLeft: 8 // dış soldan boşluk
    },
    avatarAndInfo: {
        flex: 1, // içinde olduğu komponenti doldur
        flexDirection: 'row', // içindeki elemanların diziliş yönü
        margin: 8 // etrafına boşluk
    }
});