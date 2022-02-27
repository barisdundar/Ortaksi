import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import Database from '../Database';
import DefaultButton from './DefaultButton';

// verilen oyları burda tutuyoruz
let ratings = {};

// bu kullanıcılarla deneyiminizi oylayın diyen komponent
// bu komponente hangi kullanıcıların oylanacaksa onların id si ve komponentteki TAMAM butonuna basıldığında hangi fonksiyon çağrılsın o geliyor
export default function RateUser({ userIds = [], onPressOkay = () => { } }) {
    const [loading, setLoading] = useState(true); // kullanıcıların bilgileri yükleniyor mu (ilk başta evet olarak belirliyoruz yükleyince hayır yapıyoruz)
    const [userDatas, setUserDatas] = useState([]); // kullanıcıların veritabanından yüklenmiş verilerini burda tutuyoruz

    // bu useEffect bu komponente verilen userId ler değiştiğinde çağrılıyor (aşağıdaki [userIds] de belirttiğimiz şekilde)
    useEffect(async () => {
        let datas = []; // yüklenmiş veriler burda tutuluyor
        ratings = {}; // verilen oyları ilk başta temizliyoruz önceden doldurulmuş olabilir

        for (const id of userIds) { // verilen her kullanıcı id si için
            let data = (await firestore().collection('users').doc(id).get({ source: 'server' })).data(); // o kullanıcının veritabanındaki bilgilerini alıyoruz
            data.userId = id; // kullanıcının idsini verilerine ekliyoruz
            ratings[id] = 5; // ilk başta bu kullanıcıya verilen puanı 5 yapıyoruz varsayılan olarak

            datas.push(data); // kullanıcıların verilerine ekliyoruz
        }

        setUserDatas(datas); // kullanıcıların verilerini içeren state i güncelliyoruz
        setLoading(false); // verileri yüklediğimiz için yükleniyor mu yu false yapıyoruz
    }, [userIds]);

    // verilen oyları veritabanına eklemek için çağrılan fonksiyon
    function addRatingsToDatabase() {
        for (const id of userIds) { // verilen her kullanıcı id si için
            Database.puanEkle(id, ratings[id]).catch((error) => console.error(error)); // veritabanına kaydediyoruz
        }
    }

    return (
        <Modal transparent>
            <View style={styles.modal}>
                <View style={styles.container}>
                    <Text style={styles.title}>Kullanıcı Oylama Arayüzü</Text>
                    {
                        // eğer komponent yükleniyorsa daha kullanıcıların verileri yüklenmediyse
                        loading ? (
                            // yükleniyor ekranını döndürüyoruz
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Yükleniyor...</Text>
                            </View>
                        ) : (
                            // eğer kullanıcıların verileri yüklendiyse normal arayüzü gösteriyoruz
                            <View style={{ marginTop: 13 }}>
                                <Text style={styles.rateText}>Lütfen aşağıdaki kullanıcılarla tecrübenizi oylayın: </Text>
                                {
                                    // her kullanıcı için o kullanıcıya oy verme arayüzünü oluşturuyoruz
                                    userDatas.map((data, index) => (
                                        <View style={styles.userBox} key={index}>
                                            <Text style={styles.userName}>
                                                {data.type === "driver" ? "Şoför " : "Kullanıcı "} ({data.name})
                                            </Text>
                                            <AirbnbRating
                                                count={5} // kaç tane oylama yıldızı olduğu
                                                reviews={["Çok Kötü", "Kötü", "İdare Eder", "İyi", "Çok İyi"]} // oylama yıldızlarının yazısal anlamı
                                                defaultRating={5} // ilk baştaki varsayılan oy
                                                size={20} // oylama yıldızlarının boyutu
                                                onFinishRating={(rating) => { // kullanıcı oylamayı tamamladığında
                                                    let id = data.userId; // oylanan kullanıcının id si
                                                    ratings[id] = rating; // oylamalara bu oyu kaydediyoruz
                                                }}
                                            />
                                        </View>
                                    ))
                                }
                                <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                                    <DefaultButton onPress={() => {
                                        // tamam butonuna basıldığında
                                        addRatingsToDatabase(); // veritabanına verilen oyları ekliyoruz
                                        onPressOkay(); // ve bu komponente dışardan tamam butonuna basıldığında başka bi iş yapmamız da istendiyse o fonksiyonu çağrıyoruz
                                    }}>TAMAM</DefaultButton>
                                </View>
                            </View>
                        )
                    }
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'rgba(0,0,0,0.7)', // arkaplan rengi
        flex: 1, // içinde olduğu komponenti doldur
        justifyContent: 'center'
    },
    container: {
        alignSelf: 'center', // kendini hizala // kendini hizala
        backgroundColor: '#000', // arkaplan rengi
        borderWidth: 3,
        borderColor: '#ffcc00',
        width: '80%', // genişlik
        padding: 8 // kendi içinde içten boşluk
    },
    title: {
        color: '#ffcc00', // yazı rengi
        fontSize: 16,
        fontWeight: 'bold' // yazı kalınlığı
    },
    loadingContainer: {
        height: 100, // yükseklik
        width: '100%', // genişlik
        justifyContent: 'center'
    },
    loadingText: {
        color: '#ffcc00', // yazı rengi
        alignSelf: 'center', // kendini hizala // kendini hizala
        fontSize: 16
    },
    rateText: {
        fontSize: 14,
        color: '#ffcc00' // yazı rengi
    },
    userBox: {
        margin: 8, // etrafına boşluk
        marginTop: 12,
        padding: 8, // kendi içinde içten boşluk
        borderWidth: 2,
        borderColor: '#ffcc00',
        paddingBottom: 16
    },
    userName: {
        color: '#ffcc00', // yazı rengi
        fontWeight: 'bold', // yazı kalınlığı
        fontSize: 16
    },
    starContainer: {
        backgroundColor: '#000', // arkaplan rengi
        padding: 12 // kendi içinde içten boşluk
    }
});