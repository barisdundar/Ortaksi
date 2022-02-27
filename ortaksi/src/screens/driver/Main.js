import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import BottomPopupWithButton from '../../components/BottomPopupWithButton';
import ChangeUser from '../../components/ChangeUser';
import SearchBarRightButton from '../../components/SearchBarRightButton';
import TopMessage from '../../components/TopMessage';
import { GOOGLE_MAPS_APIKEY, randevuLastCancelMinute, testUserRegions } from '../../Consts';
import Database from '../../Database';
import useIsMounted from '../../useIsMounted';
import { gpsKonumÇek, getDistanceBetween, ikiTarihArasındakiDakikaFarkınıBul } from '../../Utils';
import Loading from '../Loading';
import MarkerWithCallout from './components/MarkerWithCallout';

let interval;
let subscriber;
let randevuSubscriber;


export default function Main() {
    const isMounted = useIsMounted(); // komponent ekranda varmı yokmu ona ulaşmak için, yokken işlem yapınca hata oluşmaması için
    const [loading, setLoading] = useState(true); // bu sayfa yükleniyor mu (verileri çekerken yükleniyor yapıyoruz)
    const [customerPos, setCustomerPos] = useState(null);
    const [customerTargetPos, setCustomerTargetPos] = useState(null);
    const [user, setUser] = useState(null); // aktif giriş yapmış kullanıcıyı tutan state
    const [region, setRegion] = useState({ // olduğumuz yeri tutan state
        latitude: 0, // enlem
        longitude: 0, // boylam
        latitudeDelta: 0.0143,
        longitudeDelta: 0.0134,
        location: null,
    });
    const [customerRequests, setCustomerRequests] = useState(null); // veritabanından çektiğimiz müşteri isteklerini tutan state
    const [activeRequest, setActiveRequest] = useState({}); // şoförün aktif isteğini tutan state
    const [minuteDifferenceRandevu, setMinuteDifferenceRandevu] = useState(null); // randevuya kalan dakika

    // ekrana çıkışımızda ve ekrandan kaldırıldığımızda çağırılacak
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged((user) => { // giriş yapmış kullanıcı değiştiğinde
            if (!isMounted.current) return; // ekranda değilsek işlem yapmıyoruz

            if (user != null) {
                setUser(user); // giriş yapmış kullanıcıyı belirle
            }
        });

        return subscriber; // aboneliğimizi temizliyoruz
    }, []); // ekrana çıkışımızda ve ekrandan kaldırıldığımızda çağırılacak

    // aktif isteğin id si değiştiğinde yani aktif istek değiştiğinde çağrılıyor
    useEffect(() => {
        if (activeRequest.id) { // eğer aktif istek varsa
            if (subscriber) { // eğer daha önceden abone olduysak
                subscriber(); // aboneliği iptal ediyoruz
                subscriber = null; // aboneliği yok olarak belirliyoruz
            }

            subscriber = firestore() // veritabanımızda
                .collection('requests') // istekler tablosunda
                .doc(activeRequest.id) // aktif isteğimizin dökümanına
                .onSnapshot(async (doc) => { // olacak her değişikliklere abone oluyoruz, takip ediyoruz
                    const data = doc.data(); // değişiklik olduğunda dökümanın verisini alıyoruz

                    if (data) { // eğer veri varsa
                        // verideki ana kullanıcının id sini userId olarak kaydediyoruz
                        data.userId = data.user.id;
                        // verideki ana kullancının kendi verisini yüklüyoruz
                        data.user = (await data.user.get({ source: 'server' })).data();

                        setCustomerPos({
                            latitude: data.start.latitude,
                            longitude: data.start.longitude,
                        });

                        if (data.type !== "paylasimli") { // eğer paylaşımlı değilse
                            if (isMounted.current) {
                                setCustomerTargetPos({
                                    latitude: data.end.latitude,
                                    longitude: data.end.longitude,
                                });
                            }
                        }

                        if (isMounted.current) { // eğer ekrandaysak
                            setActiveRequest({ ...activeRequest, ...data }); // aktif isteği güncelle
                            setLoading(false); // yükleniyor ekranını kapat
                        }
                    }
                    else {
                        Database.aktifİsteğiYokEt()
                            .then(() => {
                                setActiveRequest({});
                                setLoading(false);
                            })
                    }
                })
        } // eğer aktif istek yoksa
        else {
            if (isMounted.current) { // ekrandaysak
                setCustomerPos(null);
                setCustomerTargetPos(null);
            }
        }

        return () => {
            if (subscriber) { // eğer aboneliğimiz varsa
                subscriber(); // iptal ediyoruz
                subscriber = null; // yok ediyoruz
            }
        }
    }, [activeRequest.id]) // aktif isteğin id si değiştiğinde yani aktif istek değiştiğinde çağrılıyor

    // kalan dakikayı güncelleyen fonksiyon
    function randevuTimer() {
        const requestDate = new Date(activeRequest.startTime);
        const now = new Date();

        if (isMounted.current) {
            if (activeRequest.startTime) {
                const minDiff = ikiTarihArasındakiDakikaFarkınıBul(requestDate, now);
                setMinuteDifferenceRandevu(minDiff);
            }
        }
    }

    // kalan dakikayı güncelleyecek fonksiyonu çağıracak fonksiyon
    useEffect(() => {
        if (activeRequest.startTime) {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }

            randevuTimer()
            interval = setInterval(randevuTimer, 60 * 1000); // zamanlayıcıyı oluşturuyor her 60 saniyede bir kalan dakikayı güncellemesi için

            return () => {
                if (interval) { // zamanlayıcı varsa 
                    clearInterval(interval); // temizliyor
                    interval = null;
                }
            }
        }
    }, [activeRequest.startTime]);

    useEffect(() => {
        if (activeRequest.startTime) { // randevunun başlangıç zamanı varsa
            if (minuteDifferenceRandevu < randevuLastCancelMinute) { // eğer randevuya kalan vakit belirlenen limitin altındaysa
                if (customerRequests && customerRequests.length > 0) {
                    setCustomerRequests([]); // haritada diğer kullanıcıların isteklerini görmeyi engelliyoruz istekleri boş dizi yapıp
                }
            }
        }
    }, [customerRequests]); // veritabanında müşterilerin istekleri değiştiğinde çağrılıyor

    useEffect(() => { // kullanıcı değiştiğinde çağrılıyor
        if (user) { // kullanıcı varsa
            if (testUserRegions[user.email]) { // bu kullanıcı test kullanıcılarında varsa
                if (isMounted.current) {
                    setRegion(testUserRegions[user.email].region); // kullanıcının olduğu yeri test kullanıcılarının sabit yerlerinden alıyoruz
                }
            }
            else { // eğer test kullanıcısı değilse
                gpsKonumÇek() // gps den gerçek konumunu çekiyoruz
                    .then(({ latitude, longitude }) => {
                        if (isMounted.current) {
                            setRegion({ // kullanıcının konumunu tutan state i güncelliyoruz
                                ...region,
                                latitude,
                                longitude,
                            });
                        }
                    })
                    .catch(error => {
                        return Alert.alert(error.message);
                    });
            }
        }
    }, [user]); // kullanıcı değiştiğinde çağrılıyor

    useEffect(() => { // kullanıcı değiştiğinde çağrılıyor
        if (isMounted.current) { // ekrandaysak
            setActiveRequest({}); // aktif isteği yok ediyoruz
            setLoading(true); // loading ekranını yükleniyor yapıyoruz
        }

        if (user) { // eğer giriş yapmış kullanıcı varsa
            const userDocSubscriber = firestore() // veritabanında
                .collection('users') // kullanıcılar tablosunda
                .doc(user.uid) // giriş yapmış kullanıcının dökümanına ulaşıyoruz
                .onSnapshot((doc) => {
                    const data = doc.data(); // dökümanın verisini çekiyoruz

                    if (isMounted.current) { // eğer ekrandaysak
                        if (data.activeRequest) { // eğer aktif isteğimiz varsa
                            if (data.activeRequest === "rejected") { // eğer aktif isteğimizden reddedildiysek
                                setActiveRequest({ driverRejected: true }); // aktif isteğimizden reddedildiğimizi aktif istek statemize ekliyoruz
                                setLoading(false); // yükleniyor ekranını kapatıyoruz
                            }
                            else if (data.activeRequest === "done") { // eğer aktif isteğimizi başarılı şekilde bitirdiysek
                                setActiveRequest({ done: true }); // state mize bitirdiğimizi kaydediyoruz
                                setLoading(false); // yükleniyor ekranını kapatıyoruz
                            }
                            else { // bunlar dışında aktif isteğimiz hala varsa bitmediyse reddedilmediysek
                                setActiveRequest({ id: data.activeRequest.id }) // aktif isteğimizi güncelliyoruz
                            }
                        }
                        else if (activeRequest.id) { // eğer aktif isteğimiz veritabanında yoksa ama bizim telefonumuzda varsa
                            setActiveRequest({}); // telefonumuzdaki yani yereldeki aktif isteği yok ediyoruz
                            setLoading(false); // yükleniyor ekranını kapatıyoruz
                        }
                        else { // bunlar dışında yapacak bi işlem yoksa
                            setLoading(false); // yükleniyor ekranını kapatıyoruz
                        }
                    }
                });

            return userDocSubscriber;
        }
    }, [user]); // kullanıcı değiştiğinde çağrılıyor

    useEffect(() => { // giriş yapmış kullanıcı değiştiğinde çağrılıyor
        const targetsSubscriber = firestore() // veritabanımızda
            .collection('requests') // istekler koleksiyonunda
            .onSnapshot(async (snapshot) => { // tüm istekleri alıp
                let customerRequests = []; // haritada göstereceğimiz istekleri tutacağımız yer

                if (isMounted.current) { // ekrandaysak
                    if (activeRequest.startTime && (minuteDifferenceRandevu < randevuLastCancelMinute)) {
                        setCustomerRequests([]);
                        return;
                    }
                }

                // bu kısımda haritada hangi isteklerin gözükeceğine karar veriyoruz
                // veritabanımızdaki her isteği geziyoruz
                for (const docSnapshot of snapshot.docs) {
                    const data = docSnapshot.data(); // isteğin verisini alıyoruz
                    if (data.driver == null) { // eğer isteğin şoförü yoksa
                        if (data.rejected && data.rejected.includes(user.uid)) { // eğer istekte reddedilenler varsa ve biz dahilsek
                            // sürücünün haritasına eklemiyoruz
                            continue
                        }

                        if (data.type === "paylasimli" && data.otherUser == null) {
                            // eğer paylaşımlıysa ve diğer kullanıcı bulunmadıysa yine sürücünün haritasına eklemiyoruz
                            continue
                        }

                        // bu istekteki kullanıcı yı o kullanıcınn veritabanındaki verisi olarak değiştiriyoruz
                        data.user = (await data.user.get({ source: 'server' })).data();
                        if (data.user.rate && data.user.ratedUsersCount) { // bu kullanıcının puanı ve puanlayan kişileri varsa
                            data.user.ortalamaRate = (data.user.rate / data.user.ratedUsersCount).toFixed(1); // ortalama puanını hesaplıyoruz
                        }

                        if (data.otherUser) { // eğer istekte diğer kullanıcı varsa
                            data.otherUserId = data.otherUser.id; // diğer kullanıcının idsini kaydediyoruz
                            data.otherUser = (await data.otherUser.get({ source: 'server' })).data(); // diğer kullanıcıyı da o kullanıcının veritabanındaki verisi olarak değiştiriyoruz

                            if (data.otherUser.rate && data.otherUser.ratedUsersCount) { // diğer kullanıcının ortalama puanını hesaplıyoruz
                                data.otherUser.ortalamaRate = (data.otherUser.rate / data.otherUser.ratedUsersCount).toFixed(1);
                            }
                        }

                        customerRequests.push({ id: docSnapshot.id, ...data }); // bu isteği haritada gösterilecek isteklere ekliyoruz
                    }
                }

                if (isMounted.current) { // ekrandaysak
                    setCustomerRequests(customerRequests); // haritada gösterilecek istekleri tutan state mizi güncelliyoruz
                }
            });

        return targetsSubscriber;
    }, [user]); // kullanıcı değiştiğinde çağrılıyor

    function randevuİptal() { // şoför randevusunu iptal edince çağrılıyor
        Database
            .şoförRandevuİptalEtti(activeRequest.id)
            .then(() => {
                setActiveRequest({})
            })
            .catch(error => console.error(error));
    }

    // şoför bir kullanıcının isteğini kabul ettiğinde
    function müşteriİsteğiniKabulEt(istekId, type) {
        Database
            .şoförİstekKabulEtti({ istekId, region, type }) // veritabanı dosyamızda tanımladığımız ilgili fonksiyonu çağrıyırouz
            .then(() => {
                if (isMounted.current) { // ekrandaysak
                    setActiveRequest({ ...activeRequest, id: istekId, type })
                }
            })
            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
    }

    if (loading)
        return <Loading />; // eğer yükleniyor sak yükleniyor ekranını gösteriyoruz

    return (
        <View style={styles.container}>
            <MapView
                style={{ flex: 1 }}
                region={region}
            >
                <Marker identifier="userLocation" coordinate={region} title="Senin Konumun" image={require('../../assets/images/taxi_marker.png')} />

                {
                    // haritada göstereceğimiz istekler varsa 
                    customerRequests && (
                        customerRequests.map((value, index) => { // her isteği gezip
                            return (
                                // her istek için bir MarkerWithCallout oluşturuyoruz
                                <MarkerWithCallout key={value.id} data={value} onCalloutPress={() => {
                                    müşteriİsteğiniKabulEt(value.id, value.type); // buna tıklandığında müşterinin isteğini kabul etmiş demektir, o fonksiyonu çağırıyoruz
                                }} />
                            );
                        })
                    )
                }

                {
                    customerPos && customerTargetPos && (<>
                        <MapViewDirections
                            origin={region} // başlangıç konumu
                            destination={customerPos} // bitiş konumu
                            apikey={GOOGLE_MAPS_APIKEY} // api keyimiz
                            strokeWidth={4} // kalınlık
                            mode="DRIVING" // gidiş tipi araçla
                            strokeColor="#000" // yol rengi
                        />
                        <Marker title="Müşteri" coordinate={customerPos} style={{ flex: 1 }} image={require('../../assets/images/customer_marker.png')} />
                        <MapViewDirections
                            origin={customerPos} // başlangıç konumu
                            destination={customerTargetPos} // bitiş konumu
                            apikey={GOOGLE_MAPS_APIKEY} // api keyimiz
                            strokeWidth={4} // kalınlık
                            mode="DRIVING" // gidiş tipi araçla
                            strokeColor="#ffcc00" // yol rengi
                        />
                        <Marker title="Müşterinin Gitmek İstediği Konum" coordinate={customerTargetPos} style={{ flex: 1 }} image={require('../../assets/images/target_marker.png')} />
                    </>)
                }

                {
                    (activeRequest.type === "paylasimli") && (activeRequest.start && activeRequest.end) && (<>
                        <Marker
                            title="Müşteri"
                            coordinate={{ latitude: activeRequest.start.latitude, longitude: activeRequest.start.longitude }}
                            style={{ flex: 1 }}
                            image={require('../../assets/images/customer_marker.png')}
                        />
                        <Marker
                            title="Müşteri"
                            coordinate={{ latitude: activeRequest.otherUserStart.latitude, longitude: activeRequest.otherUserStart.longitude }}
                            style={{ flex: 1 }}
                            image={require('../../assets/images/customer_marker.png')}
                        />
                        <Marker
                            title="Hedef"
                            coordinate={{ latitude: activeRequest.end.latitude, longitude: activeRequest.end.longitude }}
                            style={{ flex: 1 }}
                            image={require('../../assets/images/target_marker.png')}
                        />
                    </>)
                }

            </MapView>
            <SearchBarRightButton style={styles.searchBarRightButton} />
            {
                // eğer aktif isteğimizden reddedildiysek
                // reddedildin mesajını gösteriyoruz alttan çıkan
                // tıklandığında da aktif isteğimizi reddedildi den yok a çeviriyoruz
                activeRequest.driverRejected && <BottomPopupWithButton
                    onPress={() => {
                        // veritabanımızda aktif isteğimizi reddedildi den yok a çeviriyoruz
                        Database
                            .aktifİsteğiYokEt()
                            .then(() => {
                                if (isMounted.current) {
                                    setActiveRequest({ rejected: false }); // ondan sonra yereldeki aktif isteğimizi de yok ediyoruz
                                }
                            })
                    }}
                    message="Kullanıcı taksi kullanımından vazgeçti."
                    buttonMessage="TAMAM"
                />
            }
            {
                activeRequest.type === "paylasimli" && (<>
                    <TopMessage>
                        Haritadaki müşterileri kendi belirlediğin sıra ile alıp hedefe ulaştır.
                    </TopMessage>
                </>)
            }
            {
                activeRequest.type === "randevu" && (
                    <TopMessage boldText={minuteDifferenceRandevu <= randevuLastCancelMinute ? null : "İptal etmek için tıklayabilirsin."} onPress={() => {
                        if (minuteDifferenceRandevu <= randevuLastCancelMinute) {
                            Alert.alert("Hata", `Sadece randevuya ${randevuLastCancelMinute} dakika kala iptal edebilirsin.`)
                            return;
                        }

                        randevuİptal();
                    }}>
                        Randevulu bir isteğin var.
                        Saat {new Date(activeRequest.startTime).toLocaleTimeString()} olduğunda haritandaki kullanıcıyı almaya gitmelisin.
                        Randevuna {minuteDifferenceRandevu} dakika kaldı.
                    </TopMessage>
                )
            }
            <ChangeUser onPress={() => { setLoading(true); }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // içinde olduğu komponenti doldur
    },
    marker: {
        borderRadius: 16,
        borderWidth: 4,
        borderColor: '#FFCC00',
        width: 32, // genişlik
        height: 32, // yükseklik
        backgroundColor: '#000', // arkaplan rengi
        shadowColor: '#000'
    },
    targetQuestionButton: {
        width: 50, // genişlik
        height: 25 // yükseklik
    },
    targetQuestionButtonText: {
        fontSize: 14
    },
    searchBarRightButton: {
        position: 'absolute', // konumu diğer komponentlere göre değil sabit belli bir yerde
        top: 15, // üstten bırakılacak boşluk
        right: 15
    }
})