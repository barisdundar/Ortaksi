import React from 'react';
import { StyleSheet, Text, View } from "react-native";
import { Callout, Marker } from 'react-native-maps';

// haritada gözüken kullanıcıları ve kullanıcılara tıklandığında çıkan arayüzü sağlayan komponentimiz
// kullanıcının verisini (data), ve tekrar bu arayüze tıklandığında yani kabul edildiğinde çağrılacak fonksiyonu alıyor (onCalloutPress)
export default function MarkerWithCallout({ data, onCalloutPress }) {
    const startPos = { latitude: data.start.latitude, longitude: data.start.longitude }; // kullanıcının başlangıç konumu

    // eğer kullanıcı paylaşımlı gidiyorsa
    if (data.type === "paylasimli") {
        return (
            <Marker
                key={data.user.email} // haritadaki her markerin yani noktanın kendine has bir id si olması lazım bu o
                coordinate={startPos} // bu markerin konumu
                image={require('../../../assets/images/customer_paylasimli_marker.png')} // bu markerin logosu
            >
                <Callout // bu markere tıklandığında üstünde çıkacak arayüz (kullanıcı adını mesafeyi ücreti içeren, tıklandığında kabul etmeyi sağlayan)
                    tooltip // bunun koyulması gerekiyor react-native-maps e göre
                    onPress={onCalloutPress} // tekrar bu arayüze tıklandığında yani şoför kullanıcıyı kabul ettiğinde bu fonksiyon çağrılıyor
                >
                    <View style={styles.calloutContainer}>
                        <View>
                            <Text style={styles.calloutTextBold}>Paylaşımlı İstek</Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>{data.user.name}</Text>
                                <Text style={styles.calloutText}> (Puan: {data.user.ortalamaRate})</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>{data.otherUser.name}</Text>
                                <Text style={styles.calloutText}> (Puan: {data.otherUser.ortalamaRate})</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Hedef: </Text>
                                <Text style={styles.calloutText}>{data.destinationAddress.split(',', 2).join(',')}</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Mesafe: </Text>
                                <Text style={styles.calloutText}>{data.distance}km</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Fiyat: </Text>
                                <Text style={styles.calloutText}>{data.price}₺</Text>
                            </Text>
                            <Text style={styles.calloutTextBold}>Kabul etmek için tekrar tıkla.</Text>
                        </View>
                    </View>
                </Callout>
            </Marker>
        )
    }
    else if (data.type === "randevu") { // eğer yolculuk tipi randevulu ise
        return (
            <Marker
                key={data.user.email} // haritadaki her markerin yani noktanın kendine has bir id si olması lazım bu o
                coordinate={startPos} // bu markerin konumu
                image={require('../../../assets/images/customer_randevu_marker.png')} // bu markerin logosu
            >
                <Callout // bu markere tıklandığında üstünde çıkacak arayüz (kullanıcı adını mesafeyi ücreti içeren, tıklandığında kabul etmeyi sağlayan)
                    tooltip // bunun koyulması gerekiyor react-native-maps e göre
                    onPress={onCalloutPress} // tekrar bu arayüze tıklandığında yani şoför kullanıcıyı kabul ettiğinde bu fonksiyon çağrılıyor
                >
                    <View style={styles.calloutContainer}>
                        <View>
                            <Text style={styles.calloutTextBold}>Randevulu İstek</Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>{data.user.name}</Text>
                                <Text style={styles.calloutText}> (Puan: {data.user.ortalamaRate})</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Rndv. Saati: </Text>
                                <Text style={styles.calloutText}>{new Date(data.startTime).toLocaleTimeString()}</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Hedef: </Text>
                                <Text style={styles.calloutText}>{data.destinationAddress.split(',', 2).join(',')}</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Mesafe: </Text>
                                <Text style={styles.calloutText}>{data.distance}km</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Fiyat: </Text>
                                <Text style={styles.calloutText}>{data.price}₺</Text>
                            </Text>
                            <Text style={styles.calloutTextBold}>Kabul etmek için tekrar tıkla.</Text>
                        </View>
                    </View>
                </Callout>
            </Marker>
        )
    }
    else { // eğer yolculuk tipi paylaşımlı ya da randevulu değilse
        return (
            <Marker
                key={data.user.email} // haritadaki her markerin yani noktanın kendine has bir id si olması lazım bu o
                coordinate={startPos} // bu markerin konumu
                image={require('../../../assets/images/customer_marker.png')} // bu markerin logosu
            >
                <Callout // bu markere tıklandığında üstünde çıkacak arayüz (kullanıcı adını mesafeyi ücreti içeren, tıklandığında kabul etmeyi sağlayan)
                    tooltip // bunun koyulması gerekiyor react-native-maps e göre
                    onPress={onCalloutPress} // tekrar bu arayüze tıklandığında yani şoför kullanıcıyı kabul ettiğinde bu fonksiyon çağrılıyor
                >
                    <View style={styles.calloutContainer}>
                        <View>
                            <Text>
                                <Text style={styles.calloutTextBold}>{data.user.name}</Text>
                                <Text style={styles.calloutText}> (Puan: {data.user.ortalamaRate})</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Hedef: </Text>
                                <Text style={styles.calloutText}>{data.destinationAddress.split(',', 2).join(',')}</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Mesafe: </Text>
                                <Text style={styles.calloutText}>{data.distance}km</Text>
                            </Text>
                            <Text>
                                <Text style={styles.calloutTextBold}>Fiyat: </Text>
                                <Text style={styles.calloutText}>{data.price}₺</Text>
                            </Text>
                            <Text style={styles.calloutTextBold}>Kabul etmek için tekrar tıkla.</Text>
                        </View>
                    </View>
                </Callout>
            </Marker>
        )
    }
}

const styles = StyleSheet.create({
    calloutContainer: {
        backgroundColor: '#000', // arkaplan rengi
        flexDirection: 'row', // içindeki elemanların diziliş yönü
        width: 170, // genişlik
        padding: 8, // kendi içinde içten boşluk
        borderColor: '#ffcc00',
        borderWidth: 4
    },
    calloutTextBold: {
        color: '#ffcc00', // yazı rengi
        fontWeight: 'bold' // yazı kalınlığı
    },
    calloutText: {
        color: '#ffcc00' // yazı rengi
    }
})