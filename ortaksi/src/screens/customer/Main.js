import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from "react-native";
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import BottomPopupWithButton from '../../components/BottomPopupWithButton';
import ChangeUser from '../../components/ChangeUser';
import RateUser from '../../components/RateUser';
import SearchBarRightButton from '../../components/SearchBarRightButton';
import TopMessage from '../../components/TopMessage';
import { endDistanceLimit, GOOGLE_MAPS_APIKEY, randevuLastCancelMinute, startDistanceLimit, testUserRegions } from '../../Consts';
import Database from '../../Database';
import useIsMounted from '../../useIsMounted';
import { gpsKonumÇek, getDistanceBetween, ikiTarihArasındakiDakikaFarkınıBul } from '../../Utils';
import Loading from '../Loading';
import AcceptTarget from './components/AcceptTarget';
import MatchingRequestModal from './components/MatchingRequestModal';
import SearchBar from './components/SearchBar';
import SettingsModal from './components/SettingsModal';

/**
    request yani istek demek:
        kullanıcımız bir yerden bir yere gitmek istediğinde bunu veritabanına ekliyor ve buna istek diyoruz
 
    aktif istek demek:
        kullanıcı şuan hangi istekle ilgili o demek
        ilgili derken örneğin kendisi biyerden biyere gitmek için veritabanına eklediğinde şuan bu istekle ilgileniyor demek
*/

let zamanlayici;
let activeRequestListener;

export default function Main() {
    const isMounted = useIsMounted(); // komponent ekranda varmı yokmu ona ulaşmak için, yokken işlem yapınca hata oluşmaması için
    const [loading, setLoading] = useState(true); // yükleniyor ekranı gösterilip gösterilmeyeceiğini tutan state
    const [type, setType] = useState('bireysel'); // şuanki isteğin tipini tutan state (bireysel, paylasimli, randevu)
    const [onlySameGender, setOnlySameGender] = useState(false); // şuanki istekte sadece aynı cinsiyetten mi gidileceğini tutan state
    const [destination, setDestination] = useState(null); // gidilecek hedef yeri tutan state
    const [destinationAddress, setDestinationAddress] = useState(null); // gidilecek hedef yerin string olarak adresini tutan state
    const [duration, setDuration] = useState(null); // gidiş süresini tutan state
    const [distance, setDistance] = useState(null); // gidiş mesafesini tutan state
    const [user, setUser] = useState(null); // aktif olarak giriş yapmış kullanıcıyı tutan state
    const [userData, setUserData] = useState(null); // aktif olarak giriş yapmış kullanıcının veritabanındaki bilgilerini (ad, tckimlik, cinsiyet) tutan state
    const [region, setRegion] = useState({ // şuan olduğumuz yeri tutan state
        latitude: 0, // enlem
        longitude: 0, // boylam
        latitudeDelta: 0.0143, // zoom oranı
        longitudeDelta: 0.0134, // zoom oranı
        location: null,
    });
    const [randevuyaKalanVakit, setRandevuyaKalanVakit] = useState(null); // yolculuk isteğimiz randevuluysa randevu saatine kalan dakikayı tutacak state
    const [activeRequest, setActiveRequest] = useState({}); // aktif bir yerden bir yere gitme isteğimizi tutan state
    const [matchingRequest, setMatchingRequest] = useState({}); // paylaşımlı kullanımda bize uyan biri bulunduğunda o uyan kişinin isteğini tutan state
    const [showRequestSettingsModal, setShowRequestSettingsModal] = useState(false); // arama barından bir yer seçildiğinde gidiş ayarlarını gösteren arayüzün görünürlüğünü belirleyen state (ilk başta false yani gizli)
    const [showMatchingRequestModal, setShowMatchingRequestModal] = useState(false); // bize uyan bir ortaklaşa yolculuk varsa onun bilgilerini gösterip kabul edip etmeyeceğimizi soran arayüzün görünürlüğü

    // ekrana ilk çıktığımızda çağrılıyor
    useEffect(() => {
        const subscriber = auth().onAuthStateChanged((user) => { // aktif giriş yapmış kullanıcı değiştiğinde
            if (!isMounted.current) return; // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor

            if (user != null) { // eğer kullanıcı varsa
                setUser(user); // kullanıcıyı tutan state yi güncelliyoruz
            }
        });

        return subscriber; // ekrandan kaldırıldığımızda aboneliği iptal ediyoruz
    }, []); // ekrana ilk çıktığımızda çağrılıyor

    // giriş yapmış kullanıcı değiştiğinde çağrılıyor
    useEffect(() => {
        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
            setActiveRequest({}); // aktif isteğimizi yok ediyoruz çünkü kullanıcı değişti tekrar güncellememiz gerek
            setMatchingRequest({}); // bize uyan paylaşımlı isteği yok ediyoruz
            setLoading(true); // yükleniyor ekranını gösteriyoruz
        }

        if (user) { // eğer aktif kullanıcı varsa
            if (testUserRegions[user.email]) { // eğer aktif kullanıcı test kullanıcılarında varsa
                if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                    setRegion(testUserRegions[user.email].region); // kullanıcının konumunu test kullanıcı konumlarındaki bu emaile sahip kişinin konumu yap
                }
            }
            else { // eğer aktif kullanıcı test kullanıcılarında yoksa
                gpsKonumÇek() // gps ile kullanıcı konumunu al
                    .then(({ latitude, longitude }) => { // aldıktan sonra
                        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                            setRegion({ // kullanıcının konumunu gps den aldığımız konum olarak güncelliyoruz
                                ...region,
                                latitude,
                                longitude,
                            });
                        }
                    })
                    .catch(error => Alert.alert(error.message)); // eğer gps den konum alırken sorun çıktıysa hata mesajını gösteriyoruz
            }
        }
    }, [user]); // user değiştiğinde yani giriş yapmış kullanıcı değiştiğinde çağrılıyor

    // giriş yapmış kullanıcı değiştiğinde çağrılıyor
    useEffect(() => {
        if (user) { // eğer aktfi kullanıcı varsa
            setActiveRequest({}); // aktif isteğimizi önden yine temizliyoruz kirlilik olmasın diye, zaten birazdan yeniden çekicez bunun verisini aşağıda

            const userDocSubscriber = firestore() // veritabanında
                .collection('users') // kullanıcılar koleksiyonunda
                .doc(user.uid) // bu kullanıcının idsindeki dökümanda
                .onSnapshot((doc) => { // bir değişiklik olduğunda
                    const data = doc.data(); // dökümanın verisini alıyoruz

                    if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                        setUserData(data); // kullanıcının verisini tutan state i dökümanın verisi yapıyoruz

                        if (data.activeRequest) { // eğer veride aktif istek varsa yani kullanıcının aktif isteği varsa
                            if (data.activeRequest === "done") { // eğer aktif istek 'done' yani bitti ise
                                setLoading(false); // yükleniyor ekranını kapatıyoruz
                            }
                            else { // eğer aktif istek herhangi başka bir şey ise aktif isteğimizi tutan state mizi güncelliyoruz
                                // aktif isteğimizin id sini bu isteğin id si yapıyoruz
                                setActiveRequest({
                                    id: data.activeRequest.id
                                });
                            }
                        }
                        else if (activeRequest.id) { // eğer veritabanında aktif istek yoksa ama bizde varsa yani aktif istek kapandıysa aslında veritabanında
                            setActiveRequest({}); // biz de bizdekini yok ediyoruz
                            setLoading(false); // yükleniyor ekranını kapatıyoruz
                        }
                        else { // başka her durumda da
                            setLoading(false); // yükleniyor ekranını kapatıyoruz
                        }
                    }
                });

            return userDocSubscriber; // bu arayüz yani tüm müşteri arayüzü ekrandan giderken bu return kısmı çağrılıyor ve burda demin veritabanında abone olduğumuz dinleyiciyi yok ediyoruz
        }
    }, [user]); // user değiştiğinde yani giriş yapmış kullanıcı değiştiğinde çağrılıyor

    // bu kısım aktif isteğin id si değiştiğinde yani aktif istek değiştiğinde çağrılıyor
    useEffect(() => {
        // eğer aktif isteğin veritabanında değişikliğini dinleyen dinleyicimiz varsa
        // aboneliği iptal ediyoruz
        if (activeRequestListener) {
            activeRequestListener(); // o dinleyiciyi yok ediyoruz
            activeRequestListener = null; // dinleyiciyi yok olarak belirliyoruz
        }

        if (activeRequest.id) { // eğer aktif isteğin id si varsa yani aktif istek varsa
            activeRequestListener = firestore() // veritabanında aktif isteğe ulaşıp bi değişiklik olduğunda dinliyoruz
                .collection('requests') //  veritabanındaki requests yani istekler koleksiyonunda
                .doc(activeRequest.id) // aktif isteğin idsine yani aktif isteğe ulaşıyoruz
                .onSnapshot(async (doc) => { // bir değişiklik olduğunda bu veride (içinde await kullanabilmek için async yapmak gerekiyor)
                    const data = doc.data(); // verinin içeriğini alıyoruz

                    if (data) { // eğer verinin içeriği doluysa 
                        if (isMounted.current) // ve kullanıcı hala bu sayfadaysa (bu sayfada olmadığımızda işlem yaparsak hata veriyor)
                        {
                            // isteğimizdeki şoförün verisini çektik
                            if (data.driver) { // eğer isteğin sürücüsü varsa
                                data.driverId = data.driver.id; // isteğin üstüne sürücünün idsini kaydediyoruz driverId şeklinde
                                data.driver = (await data.driver.get({ source: 'server' })).data(); // sürücünün verisine ulaşıyoruz ve sürücüyü sürücünün verisi olarak değiştiriyoruz
                                if (data.driver.rate && data.driver.ratedUsersCount) { // eğer sürücünün puanı varsa ve sürücüye puan veren kişi sayısı da varsa
                                    data.driver.ortalamaRate = (data.driver.rate / data.driver.ratedUsersCount).toFixed(1); // isteğe sürücünün ortalama puanını kaydediyoruz ortalamaRate adı altında
                                }
                            }

                            // isteğimizdeki diğer kullanıcının verisini çektik
                            if (data.otherUser) { // eğer istekte başka bir kullanıcı varsa (paylaşımlı kullanıcı olduğunda yani)
                                data.otherUserId = data.otherUser.id; // istekteki diğer kullanıcının id sini otherUserId şeklinde kaydediyoruz
                                data.otherUser = (await data.otherUser.get({ source: 'server' })).data(); // istekteki diğer kullanıcıyı kullanıcının verisi olarak değiştiriyoruz (yukarda şoförde yaptığımız gibi)

                                if (data.otherUser.rate && data.otherUser.ratedUsersCount) { // eğer diğer kullanıcının isteğindeki kullanıcının yani özetle kendisinin puanı varsa ve puanlayan kişi sayısı varsa
                                    data.otherUser.ortalamaRate = (data.otherUser.rate / data.otherUser.ratedUsersCount).toFixed(1); // ortalama puanı bul ve kaydet
                                }
                            }

                            setActiveRequest({ ...activeRequest, ...data }); // aktif istek statine veritabanından aldığımız bilgileri ekliyoruz
                            setDuration(data.duration); // yolun ne kadar süreceğini state e kaydediyoruz
                            setDistance(data.distance); // yolun mesafesini belirliyoruz
                            setDestination({ // hedef konumumuzu güncelliyoruz
                                latitude: data.end.latitude,
                                longitude: data.end.longitude
                            });
                            setDestinationAddress(data.address); // hedef adresimizi güncelliyoruz
                            setLoading(false); // veritabanından bilgileri çektiğimiz için artık yükleniyor ekranını kapatıyoruz
                        }
                    } else {
                        Database.aktifİsteğiYokEt()
                            .then(() => {
                                setActiveRequest({});
                                setLoading(false);
                            })
                    }
                });
        }
        else { // eğer yereldeki aktif istek yoksa
            if (isMounted.current) { // eğer bu arayüz hala ekrandaysa ve istek ayarları arayüzü gözükmüyorsa
                setDestination(null); // hedefimizi tutan state yi boşalt
                setDestinationAddress(null); // hedef adresimizi tutan state yi boşalt
            }
        }

        return () => { // bu arayüz ekrandan kaldırılırken bu fonksiyon çağrılıyor
            // veritabanındaki aboneliğimizi iptal ediyoruz
            if (activeRequestListener) { // eğer aktif isteğin veritabanındaki değişikliklerini dinleyen dinleyici varsa
                activeRequestListener(); // dinleyiciyi yok ediyoruz
                activeRequestListener = null; // dinleyiciyi yok olarak belirliyoruz
            }
        }
    }, [activeRequest.id]) // aktif isteğin id si değiştiğinde yani aktif istek değiştiğinde çağrılıyor üst kısımdaki useEffect

    // her 60 saniyede bir çağrılan fonksiyon, nasıl 60 saniyede bir çağrıldığı aşağıdaki setInterval kısmında
    // bu fonksiyon randevuya kalan zamanı güncelliyor
    function randevuTimer() {
        const randevuVakti = new Date(activeRequest.startTime); // isteğin, randevumuzun vakti
        const simdi = new Date(); // şuanki vakit

        if (simdi > randevuVakti) { // eğer şuanki vakit isteğin vaktinden büyükse yani isteğin vakti geçtiyse
            randevuİptal(); // isteği iptal ediyoruz
            return;
        }

        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
            if (activeRequest.startTime) { // eğer isteğin başlangıç zamanı varsa (hata olmasın diye kontrol)
                const dakikaFarki = ikiTarihArasındakiDakikaFarkınıBul(randevuVakti, simdi); // 2 vakit arasındaki dakika farkını buluyoruz
                setRandevuyaKalanVakit(dakikaFarki); // randevu saatimize kalan dakikayı tutan state güncelliyoruz
            }
        }
    }

    // aktif isteğin tipi değiştiğinde çağrılıyor
    // randevulu bir istek başlattığımızda 60 saniyede bir kaç dakika kaldığını gösterecek zamanlayıcıyı oluşturmak için kullanıyoruz
    useEffect(() => {
        if (zamanlayici) { // eğer zaten 60 saniyede bir tekrar eden zamanlayıcımız varsa
            clearInterval(zamanlayici); // o zamanlayıcıyı temizliyoruz yani yok ediyoruz
            zamanlayici = null; // zamanlayıcıyı yok olarak belirliyoruz temizlediğimiz için
        }

        if (activeRequest.type === "randevu") { // eğer aktif isteğin tipi randevuysa yani randevulu bir istek yaptıysak
            randevuTimer() // 60 saniyede bir dakikayı güncelleyecek şeyi önden 1 kez çağırıyoruz
            zamanlayici = setInterval(randevuTimer, 60 * 1000); // 60 saniyede bir çağrılması için bir zamanlayıcı (interval) oluşturuyoruz
        }

        return () => { // bu arayüz ekrandan gittiğinde zamanlayıcıyı temizliyoruz
            if (zamanlayici) { // eğer zamanlayıcı varsa
                clearInterval(zamanlayici); // zamanlayıcıyı temizliyoruz
                zamanlayici = null; // zamanlayıcıyı yok olarak belirliyoruz
            }
        }
    }, [activeRequest.type]); // aktif isteğin tipi değiştiğinde

    // arama barından bi yer seçildiğinde çağrılıyor
    // desc seçilen yerin genel bilgisi, details ise seçilen yerin enlem boylamı gibi detaylı bilgileri
    function aramaBarındanHedefSeçildiğinde(desc, details) {
        const { lat, lng } = details['geometry']['location']; // lat,lng yani enlem,boylam ı details içindeki geometry içinden location a ulaşarak alıyoruz
        const dest = { // aldığımız enlem boylamı düzgün bir yerde topluyoruz
            latitude: lat,
            longitude: lng
        };

        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
            setDestinationAddress(desc.description); // hedef adresimizi tutan state i güncelliyoruz
            setDestination(dest); // hedefimizi güncelliyoruz
        }
    }

    // kullanıcının biyerden biyere gitme isteğini veritabanına ekliyor
    // kullanıcının kendi isteğini oluşturuyor gidip başkasının isteğine ortak olarak vesaire eklemiyor
    function kullanıcınınKendiİsteğiniOluştur({ type, onlySameGender, startTime = null }) {
        Database
            .hedefKonumuKabulEtti({ // tanımladığımız ilgili fonksiyonu çağırıyoruz
                type: type, // gidiş tipimiz
                onlySameGender: onlySameGender, // sadece aynı cinsiyetlemi gidiyoruz
                startTime: startTime, // başlangıç vakti (randevuluysa)
                start: region, // başlangıç enlem boylamı
                end: destination, // hedef enlem boylamı
                distance: distance, // mesafe
                duration: duration, // süre
                destinationAddress: destinationAddress // hedef adresi
            })
            .then((doc) => { // veritabanına ekleme tamamlandıktan sonra
                if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                    setActiveRequest({ id: doc.id }); // aktif isteği bu istek yapıyoruz
                    setShowRequestSettingsModal(false); // istek ayarları ekranı hala gözüküyorsa onu kapatıyoruz
                    setShowMatchingRequestModal(false);
                }
            })
            .catch(error => console.error(error)); // hata varsa yazdırdık
    }

    // kullanıcı bir yer seçip ayarları doldurup sonra gitmek istediğini onayladığında
    function gidişAyarlarıOnaylandığında({ type, onlySameGender, selectedTime }) {
        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
            setType(type); // gidiş tipini tutan state imizi güncelliyoruz
            setOnlySameGender(onlySameGender); // sadece aynı cinsiyetten mi gidilip gidilmeyeceğini tutan state mizi güncelliyoruz
        }

        if (type === "paylasimli") { // eğer gitmek isteme şeklimiz paylaşımlı ise
            // bu kısımda eğer isteğimiz paylaşımlı ise bize uygun istek var mı onu arıyoruz
            firestore() // veritabanımızda
                .collection("requests") // istekler koleksiyonunun
                .get({ source: "server" }) // tamamını alıyoruz (get = 1 seferlik çekiyor, abonelik değil)
                .then(async (snapshot) => { // aldığımız veri
                    let katilabilecegimizIstek; // paylaşımlı istek yaptıysak bizimle uyumlu bi istek varsa burda tutulacak

                    for (const doc of snapshot.docs) { // requests koleksiyonundan aldığımız verideki her döküman için yani her request için
                        const data = doc.data(); // requestin verisi
                        const anaKullaniciVerisi = (await data.user.get({ source: "server" })).data(); // bu requestin sahibinin verisi

                        // ana kullanıcının ortalama puanını hesaplıyoruz
                        if (anaKullaniciVerisi.rate && anaKullaniciVerisi.ratedUsersCount) { // eğer ana kullanıcının puanı varsa ve onu puanlayan kullanıcı sayısı varsa
                            anaKullaniciVerisi.ortalamaRate = (anaKullaniciVerisi.rate / anaKullaniciVerisi.ratedUsersCount).toFixed(1); // ana kullanıcının ortalama puanını da oluşturuyoruz daha sonra kullanmak için
                        }

                        // eğer isteğin tipi paylaşımlı değilse bize uygun değildir
                        if (data.type !== "paylasimli") {
                            continue; // bu isteği geçiyoruz
                        }

                        //  eğer bu istek devre dışı bırakıldıysa ya da istekte başka bir kullanıcı varsa bu isteğe katılamayız o yüzden bu da uygun değil
                        if (data.disabled || data.otherUser) {
                            continue; // bu isteği geçiyoruz
                        }

                        // eğer bu isteğin sahibi bizsek kendi isteğimize paylaşımlı olarak katılamayacağımızdan bunu da geçiyoruz
                        if (data.user.id === user.uid) {
                            continue; // bu isteği geçiyoruz
                        }

                        // eğer biz sadece kendi cinsiyetimizle gitmek istiyorsak ve bu istekteki kullanıcının cinsiyeti bizle aynı değilse
                        if (onlySameGender && anaKullaniciVerisi.gender !== userData.gender) {
                            continue; // bu isteği geçiyoruz
                        }

                        // eğer bu kullanıcı sadece aynı cinsiyetli kişilerle gitmek istiyorsa ve cinsiyetimiz aynı değilse
                        if (data.onlySameGender && anaKullaniciVerisi.gender !== userData.gender) {
                            continue; // bu isteği geçiyoruz
                        }

                        // bu kullanıcıyla başlangıç konumlarımız arasındaki mesafe
                        const baslangicKonumlariMesafe = await getDistanceBetween(region, data.start);
                        // bu kullanıcıyla hedef konumlarımız arasındaki mesafe
                        const hedefKonumlariMesafe = await getDistanceBetween(destination, data.end);

                        // eğer başlangıç konumlarımız arasındaki mesafe önceden tanımladığımız mesafenin içindeyse ve
                        // hedef konumlarımız arasındaki mesafe de önceden tanımladığımız mesafenin içindeyse
                        if (baslangicKonumlariMesafe < startDistanceLimit && hedefKonumlariMesafe < endDistanceLimit) {
                            if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                                setMatchingRequest({ id: doc.id, ...data, user: anaKullaniciVerisi }) // bize uygun bi istek bulduk demektir bunu kabul ediyoruz
                            }
                            katilabilecegimizIstek = doc; // katılacağımız isteği yine kaydediyoruz
                            break; // döngüden çıkıyoruz çünkü uygun bi istek bulduk
                        }
                        else { // eğer başlangıç ve hedef konumlarımız belirlediğimiz sınırlar içinde değilse
                            continue; // bu isteği geçiyoruz
                        }
                    }

                    // eğer katılınacak bi istek bulabildiysek veritabanında
                    if (katilabilecegimizIstek) {
                        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                            setShowRequestSettingsModal(false); // istek ayarları menüsünü kapatıyoruz
                            setShowMatchingRequestModal(true); // sana uygun paylaşımlı bi istek bulduk menüsünü açıyoruz
                        }
                    }
                    else { // eğer katılınacak bi istek bulamadıysak
                        kullanıcınınKendiİsteğiniOluştur({ type, onlySameGender }); // kullanıcının kendi isteğini herkesten ayrı şekilde oluşturuyoruz 
                    }
                })
                .catch(error => console.error(error)) // hata varsa yazdırıyoruz
        }
        else if (type === "randevu") { // eğer gidiş şeklimizi randevulu olarak seçtiysek
            kullanıcınınKendiİsteğiniOluştur({ type, onlySameGender, startTime: selectedTime }); // veritabanına kendi isteğimizi ekliyoruz
        }
        else { // eğer gidiş tipini paylaşımlı ya da randevuludan farklı bir şey seçtiysek (doğal olarak bireysel kalıyor)
            kullanıcınınKendiİsteğiniOluştur({ type, onlySameGender }); // veritabanına kendi isteğimizi ekliyoruz
        }
    }

    // kullanıcı bir yer seçip gitmek istemediğine karar verdiğinde (daha taksi bekleniyor falan olmadan)
    function biryerSeçipİptalEdildiğinde() {
        if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
            setDestination(null);
            setDestinationAddress(null);
        }
    }

    // kullanıcı taksiyi beklerken, taksiciyi kabul etmeden önce isteğini iptal ederse
    // taksi bekleniyor ken iptal
    function taksiciBeklerkenİptal() {
        Database
            .taksiBeklerkenİptal() // veritabanında tanımladığımız ilgili fonksiyonu çağırıyoruz
            .then(() => { // sonuç başarılı şekilde geldiğinde
                if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                    setActiveRequest({}); // aktif isteğimizi başarıyla iptal ettiğimizden aktif isteği tutan state mizi de boşaltıyoruz
                }
            })
            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
    }

    // kullanıcı randevusunu iptal etmek istediğinde çağrılacak fonksiyon
    function randevuİptal() {
        Database
            .taksiBeklerkenİptal() // tanımladığımız ilgili fonksiyonu çağırıyoruz
            .then((data) => { // başarılı sonuçlandığında
                if (data.driver) { // eğer şoför varsa
                    data.driver.update({ // şoförün veritabanındaki verisini güncelleyip şoförün reddedildiğini kaydediyoruz aslında reddedilmedi istek iptal oldu ama fark etmez
                        randevuRequest: 'rejected'
                    })
                }
                setActiveRequest({}); // yereldeki isteğimizi yok ediyoruz
            })
            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
    }

    // kullanıcı bir taksiciyi reddettiğinde
    function taksiciReddedildiğinde() {
        Database
            .istektekiTaksiciyiReddet(activeRequest.id)
            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
    }

    // kullanıcı bir taksiciyi kabul ettiğinde
    function taksiciKabulEdildiğinde() {
        Database
            .taksiciyiKabulEt(activeRequest.id)
            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
    }

    // yolculuk başarılı şekilde tamamlandığında (tamamla ya tıklandığında)
    function yolculukTamamlandı() {
        const driverId = activeRequest.driverId; // yolculuğun şoförünün idsi

        Database
            .yolculuğuTamamla({ istekId: activeRequest.id, driverId }) // tanımladığımız ilgili fonksiyonu çağırıyoruz
            .then(() => {
                if (isMounted.current) { // eğer kullanıcı arayüzü hala ekrandaysa işlemleri yapıyoruz, bu sayfa ekranda değilken state değiştirirsek hata veriyor
                    setActiveRequest({});
                }
            })
            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
    }

    // arayüzde aşağıda çıkan mesajı gösterecek fonksiyon, koşullara göre mesela şoför varsa kabul et gösteriyor şoför yoksa isteği iptal et gösteriyor vs.
    function altMesajGöster() {
        // şu anki isteğin bir şoförü yoksa
        if (!activeRequest.driver) {
            // isteğin tipi paylaşımlıysa
            if (activeRequest.type === "paylasimli") {
                // isteğe başka paylaşımlı kullanıcı katıldıysa
                if (activeRequest.otherUser) {
                    // eğer o sonradan katılan paylaşımlı kullanıcının id si bize eşitse (paylaşımlı kullanıcı bizsek)
                    if (activeRequest.otherUserId === auth().currentUser.uid) {
                        // eğer ana kullanıcı bizi kabul etmediyse
                        if (!activeRequest.isOtherUserAccepted) {
                            return <BottomPopupWithButton
                                onPress={() => Database.diğerKullanıcıİptalEtti(activeRequest.id)}
                                message="Ana kullanıcının seni kabul etmesi bekleniyor."
                                buttonMessage="İPTAL"
                            />
                        }
                        // ana kullanıcı bizi kabul ettiyse
                        else {
                            // sonradan katılan kullanıcının taksi bekleniyor yazısı
                            return <BottomPopupWithButton onPress={() => {
                                Database.diğerKullanıcıİptalEtti(activeRequest.id);
                            }} message="Taksi bekleniyor." buttonMessage="İPTAL" />
                        }
                    }
                    // eğer sonradan katılan paylaşımlı kullanıcı biz değilsek
                    else {
                        // eğer sonradan katılan kullanıcı kabul edilmediyse
                        if (!activeRequest.isOtherUserAccepted) {
                            // sana uygun bir paylaşımlı kullanıcı bulduk ekranı
                            return <MatchingRequestModal
                                userData={activeRequest.otherUser} // paylaşımlı kullanıcının bilgileri
                                onAccept={() => {
                                    // paylaşımlı kullanıcı kabul edildiğinde
                                    firestore() // veritabanımızda
                                        .collection('requests') // istekler koleksiyonunda
                                        .doc(activeRequest.id) // bizim isteğimizde
                                        .update({
                                            isOtherUserAccepted: true // diğer kullnıcının kabul edildiğini true yapıyoruz
                                        })
                                }} onReject={() => { // diğer kullanıcı reddedilirse
                                    Database.istektekiDiğerKullanıcıyıReddet(activeRequest.id); // tanımladığımız ilgili fonksiyonu çağırıp veritabanını düzenliyoruz
                                }} />
                        }
                        // eğer sonradan katılan kullanıcı kabul edildiyse
                        else {
                            // ana kullanıcının taksi bekleniyor yazısı
                            return <BottomPopupWithButton onPress={() => {
                                // taksi iptal edilirse bu fonksiyon çağrılıyor
                                Database
                                    .istektekiDiğerKullanıcıyıReddet(activeRequest.id) // önce diğer paylaşımlı kullanıcıyı isteğimizden atıyoruz ki o yalnız aramaya devam etsin
                                    .then(() => {
                                        Database.taksiBeklerkenİptal(); // sonra taksiyi iptal ediyoruz
                                    })
                            }} message="Taksi bekleniyor." buttonMessage="İPTAL" />
                        }
                    }
                }
                // isteğe başka paylaşımlı kullanıcı katılmadıysa
                else {
                    return <BottomPopupWithButton
                        onPress={taksiciBeklerkenİptal} // İPTAL butonuna tıklandığında taksi iptal fonksiyonunu çağırıyoruz
                        message="Paylaşımlı gidilecek kullanıcı bekleniyor."
                        buttonMessage="İPTAL" />
                }
            }
            else if (activeRequest.type === "randevu") {
                return <BottomPopupWithButton
                    onPress={taksiciBeklerkenİptal} // İPTAL butonuna tıklandığında taksi iptal fonksiyonunu çağırıyoruz
                    message="Seni belirttiğin saatte götürecek taksici bekleniyor."
                    buttonMessage="İPTAL" />
            }
            // isteğin tipi bireyselse
            else {
                return <BottomPopupWithButton
                    onPress={taksiciBeklerkenİptal} // İPTAL butonuna tıklandığında taksi iptal fonksiyonunu çağırıyoruz
                    message="Taksi bekleniyor."
                    buttonMessage="İPTAL" />
            }
        }
        // şu anki isteğin bir şoförü varsa
        else {
            // şu anki isteğin tipi paylaşımlıysa
            if (activeRequest.type === "paylasimli") {
                // sadece ana kullanıcıya göstermek için öbür kullanıcı bize eşit mi diye bakıyoruz, eşit değilse biz ana kullanıcıyızdır
                if (activeRequest.otherUserId !== auth().currentUser.uid) {
                    // eğer istekteki şoför kabul edilmediyse
                    if (!activeRequest.accepted) {
                        return <BottomPopupWithButton
                            onPress={taksiciKabulEdildiğinde} // KABUL ET butonuna tıklandığında şoför kabul etme fonksiyonumuzu çağırıyoruz
                            button2OnPress={taksiciReddedildiğinde} // REDDET butonuna tıklandığında şoför reddetme fonksiyonumuzu çağırıyoruz
                            message={`${activeRequest.driver.name} isimli şoför (Puan: ${activeRequest.driver.ortalamaRate || "Yok"}) isteğini kabul etti. ${activeRequest.driver.plate} plakalı taksi yolda.`}
                            buttonMessage="KABUL ET" // birinci butonun yazısı
                            button2Message="REDDET" /> // ikinci butonun yazısı
                    }
                }
            }
            else if (activeRequest.type === "randevu") {
                // eğer istekteki şoför kabul edilmediyse
                if (!activeRequest.accepted) {
                    return <BottomPopupWithButton
                        onPress={taksiciKabulEdildiğinde} // KABUL ET butonuna tıklandığında şoför kabul etme fonksiyonumuzu çağırıyoruz
                        button2OnPress={taksiciReddedildiğinde} // REDDET butonuna tıklandığında şoför reddetme fonksiyonumuzu çağırıyoruz
                        message={`${activeRequest.driver.name} isimli şoför (Puan: ${activeRequest.driver.ortalamaRate || "Yok"}) isteğini kabul etti. ${activeRequest.driver.plate} plakalı taksisiyle seni belirttiğin saatte alacak.`}
                        buttonMessage="KABUL ET" // birinci butonun yazısı
                        button2Message="REDDET" /> // ikinci butonun yazısı
                }
            }
            // şu anki isteğin tipi paylaşımlı ya da randevulu değilse (doğal olarak bireysel)
            else {
                // eğer istekteki şoför kabul edilmediyse
                if (!activeRequest.accepted) {
                    return <BottomPopupWithButton
                        onPress={taksiciKabulEdildiğinde} // KABUL ET butonuna tıklandığında şoför kabul etme fonksiyonumuzu çağırıyoruz
                        button2OnPress={taksiciReddedildiğinde} // REDDET butonuna tıklandığında şoför reddetme fonksiyonumuzu çağırıyoruz
                        message={`${activeRequest.driver.name} isimli şoför (Puan: ${activeRequest.driver.ortalamaRate || "Yok"}) isteğini kabul etti. ${activeRequest.driver.plate} plakalı taksi yolda.`}
                        buttonMessage="KABUL ET" // birinci butonun yazısı
                        button2Message="REDDET" /> // ikinci butonun yazısı
                }
            }
        }

        return null; // hiç bir şey döndürmediysek null döndürüyoruz yoksa hata veriyor
    }

    // ortaklaşa katılan kullanıcıların birbirlerini haritada görebilmelerini ve nasıl göreceklerini döndüren fonksiyonumuz
    function kullanıcıBHaritadakiİşareti() {
        if (activeRequest.type === "paylasimli" && activeRequest.isOtherUserAccepted) { // eğer aktif isteğimizin tipi paylaşımlı ise ve sonradan katılan kullanıcı kabul edildiyse
            if (activeRequest.otherUser) { // eğer aktif isteğimize paylaşımlı bir kullanıcı katıldıysa
                if (activeRequest.otherUserId === auth().currentUser.uid) { // eğer paylaşımcı kullanıcının id si bizim id miz se (yani sonradan katılan paylaşımcı kullanıcı aslında bizsek)
                    return <Marker identifier="otherUserLocation" // haritaya bir nokta ekliyoruz
                        coordinate={{ latitude: activeRequest.start.latitude, longitude: activeRequest.start.longitude }} // koordinatları aktif isteğin başlangıç konumu
                        title="Diğer Kullanıcı Konumu" // bu noktaya tıklandığında yazacak şey
                        image={require('../../assets/images/customer_marker.png')} /> // bu noktanın logosu
                }
                else { // eğer sonradan katılan paylaşımlı kullanıcı biz değilsek
                    return <Marker identifier="otherUserLocation"
                        coordinate={{ latitude: activeRequest.otherUserStart.latitude, longitude: activeRequest.otherUserStart.longitude }} // noktanın koordinatları diğer kullanıcının konumu
                        title="Diğer Kullanıcı Konumu" // bu noktaya tıklandığında yazacak şey
                        image={require('../../assets/images/customer_marker.png')} /> // bu noktanın logosu
                }
            }
        }

        return null; // hiç bir şey döndürmediysek null döndürüyoruz yoksa hata veriyor
    }

    // haritada hedefimize yada taksiciden bize gelen yol çizgilerini döndüren fonksiyon
    function haritadakiYollar() {
        if (activeRequest.type === "bireysel" || destination) { // eğer aktif isteğimiz bireysel bi istekse ya da hedef konumumuz varsa
            return <>
                <MapViewDirections
                    origin={region} // yolun başlangıcı bizim konumumuz
                    destination={destination} // yolun hedefi hedef konumumuz
                    apikey={GOOGLE_MAPS_APIKEY} // google cloud console > maps > credentials den aldığımız api key
                    strokeWidth={4} // bulduğu yolun kalınlığı ne olacak
                    mode="DRIVING" // yürüyerek mi araçla mı gidiş için yol bulacak, bizimkisi taksi o yüzden araçla
                    onReady={({ distance, duration }) => { // hedefe yol bulma işlemi tamamlandığında bu fonksiyon çağrılıyor
                        if (isMounted.current) { // eğer bu arayüz hala ekrandaysa (değilken state değiştirirsek hata veriyor)
                            setDistance(distance); // bulduğu yolun süre olarak uzunluğu nu state mizde güncelliyoruz
                            setDuration(duration); // bulduğu yolun uzunluğu nu state mizde güncelliyoruz
                        }
                    }}
                />
                <Marker
                    identifier="userDestination" // haritada kullanıcının konumuna bi nokta koyuyoruz
                    coordinate={destination} // noktanın konumu kullanıcının konumu
                    style={{ flex: 1 }} // bunun böyle yapılması gerekiyor öyle tavsiye edilmiş
                    title={destinationAddress} // noktaya tıklandığında gözükecek başlık
                    image={require('../../assets/images/target_marker.png')} // noktanın logosu
                />
            </>
        }

        return null; // hiç bir şey döndürmediysek null döndürüyoruz yoksa hata veriyor
    }

    // bi istek başarıyla tamamlandığında ekranda çıkacak şeyleri döndüren fonksiyon
    function istekTamamlandığındaEkrandaÇıkacak() {
        // eğer aktif isteğimizin ana kullanıcısı varsa ve o kullanıcı bizsek yani aktif isteğin sahibi bizsek
        if (activeRequest.user && activeRequest.user.id === user.uid) {
            if (activeRequest.accepted) { // eğer aktif isteğimizdeki şoför kabul edildiyse
                if (activeRequest.type === "randevu") {  // eğer aktif istek randevulu bi istekse
                    if (randevuyaKalanVakit < randevuLastCancelMinute) { // randevu saatine önceden belirlediğimiz dakika kalana kadar bekle ondan sonra tamamlama ekranını göster
                        return <BottomPopupWithButton // alttan çıkan tamamlandı arayüzü göster
                            onPress={yolculukTamamlandı}  // tıklandığında aktif isteği bitiren fonksiyonu çağır
                            message="Test aşamasında olunduğundan aşağıdaki butona basılarak yolculuk tamamlanabilir."
                            buttonMessage="TAMAMLA"
                        />
                    }
                    else { // eğer randevu saatine daha varsa
                        return <TopMessage // yukarda çıkan randevulu bir isteğin var saat şu saatte ekranı burda gösteriliyor
                            boldText="İptal etmek için tıklayabilirsin." // o mesajın altında kalın yazıyla yazılan mesaj
                            onPress={() => {
                                // randevu iptal edilmeye çalışıldığında bu fonksiyon çağrılır
                                if (randevuyaKalanVakit <= randevuLastCancelMinute) { // eğer randevu iptal vakti geçtiyse
                                    Alert.alert("Hata", `Sadece randevuya ${randevuLastCancelMinute} dakika kala iptal edebilirsin.`) // iptal etmeye izin verme ve hata mesajı göster
                                    return;
                                }

                                randevuİptal(); // randevuyu iptal eden fonksiyonu çağır
                            }}
                        >
                            Randevulu bir isteğin var,
                            {activeRequest.driver.plate} plakalı araç seni {new Date(activeRequest.startTime).toLocaleTimeString()} vaktinde alacak.
                            60 dakika kala isteğini tamamlama seçeneği gözükecektir.
                            Randevuna {randevuyaKalanVakit} dakika kaldı.
                            </TopMessage>
                    }
                }
                else { // eğer aktif istek randevulu bi istek değilse
                    return <BottomPopupWithButton // bireysel ya da paylaşımlı kullanıcı için tamamlama butonunu göster
                        onPress={yolculukTamamlandı} // butona tıklandığında aktif isteği bitirme fonksiyonunu çağır
                        message="Test aşamasında olunduğundan aşağıdaki butona basılarak yolculuk tamamlanabilir."
                        buttonMessage="TAMAMLA"
                    />
                }
            }
        }

        return null; // hiç bir şey döndürmediysek null döndürüyoruz yoksa hata veriyor
    }

    if (loading) // eğer yükleniyorsa
        return <Loading />; // yükleniyor ekranını göster

    /**
        müşteri arayüzünü çizdiriyoruz

        <MapView> haritayı çizdiriyor        
            sonra onun içinde aktif isteğin durumuna göre MapViewDirections ile 2 yer arasında yol çiziliyor
            <Marker> ler sayesinde haritaya kullanıcı logoları çiziliyor

        <SearchBar> müşteri arayüzünde yukardaki arama barını çiziyor
        <SearchBarRightButton> arama barının yanındaki üç çizgili butonu çizdiriyor
     */

    return (
        <View style={styles.container}>
            <MapView
                style={{ flex: 1 }}
                region={region}
            >
                <Marker identifier="userLocation" coordinate={region} title="Senin Konumun" image={require('../../assets/images/location_marker.png')} />

                {
                    // haritada 2 yer arasında bulduğu yolu çizdirmek için fonksiyonumuz yukarda tanımlandı
                    haritadakiYollar()
                }
                {
                    // aktif isteğin tipi paylaşımlı değilse ve aktif istekte şoför varsa
                    // şoförden bize bir yol çiziyoruz
                    (activeRequest.type !== 'paylasimli' && activeRequest.driver) && (
                        <MapViewDirections
                            origin={{ latitude: activeRequest.driver.location.latitude, longitude: activeRequest.driver.location.longitude }}
                            destination={region}
                            apikey={GOOGLE_MAPS_APIKEY}
                            strokeWidth={4} // bulduğu yolun kalınlığı ne olacak
                            mode="DRIVING" // yürüyerek mi araçla mı gidiş için yol bulacak, bizimkisi taksi o yüzden araçla
                            strokeColor="#ffcc00"
                        />
                    )
                }
                {
                    // eğer aktif isteğin şoförü varsa
                    // haritaya şoförü ekliyoruz
                    activeRequest.driver &&
                    <Marker
                        identifier="taxiLocation"
                        coordinate={{ latitude: activeRequest.driver.location.latitude, longitude: activeRequest.driver.location.longitude }}
                        title={activeRequest.driver.plate} description={activeRequest.driver.name}
                        image={require('../../assets/images/taxi_marker.png')} />
                }
                {
                    // aktif istek varsa paylaşımlı diğer kullanıcıyı haritaya ekleyecek fonksiyonu çağırıyoruz
                    activeRequest.id && kullanıcıBHaritadakiİşareti()
                }
            </MapView>
            {
                // eğer aktif istek varsa arama barını çiziyoruz
                // aktif istek yoksa sadece arama barının yanındaki 3 tane çizgili butonu çiziyoruz
                !activeRequest.id ?
                    <SearchBar onTargetLocationSelected={aramaBarındanHedefSeçildiğinde} />
                    :
                    <SearchBarRightButton style={styles.searchBarRightButton} />
            }
            {
                // eğer aktif istek varsa arayüzde aşağıda çıkan mesajı gösterecek fonksiyonu çağırıyoruz yukarda tanımlı
                activeRequest.id && altMesajGöster()
            }
            {
                // eğer aktif istek varsa aktif isteği bitirecek arayüzü gösteren fonksiyonu çağırıyoruz yukarda tanımlı
                activeRequest.id && istekTamamlandığındaEkrandaÇıkacak()
            }
            {
                // eğer hedef adres varsa ve hedefe olan mesafe varsa ve hedefe olan süre varsa ve aktif istek yoksa
                // hedefi kabul etme arayüzünü göster
                (destinationAddress && distance && duration && !activeRequest.id) &&
                <AcceptTarget
                    targetAddress={destinationAddress} // hedef adresi veriyoruz
                    distance={distance} // mesafeyi veriyoruz
                    duration={duration} // süreyi veriyoruz
                    onAccept={() => { // kullanıcı hedefi kabul ederse
                        setShowRequestSettingsModal(true); // istek ayarlar menüsünü gösteriyoruz
                    }}
                    onCancel={biryerSeçipİptalEdildiğinde} /> // iptal edilirse iptal edildiğinde yapılacak işlemleri içeren fonksiyonu çağırıyoruz
            }
            {
                // eğer istek ayarlar menüsünü göstermemiz isteniyorsa gösteriyoruz
                showRequestSettingsModal && <SettingsModal
                    onTargetLocationAccept={gidişAyarlarıOnaylandığında} // ayarlar tamamlanıp kabul edildiğinde bu fonksiyon çağrılsın
                    onTargetLocationCancel={() => { // ayarlar kabul edilmeden iptal edilirse bu fonksiyon çağrılsın
                        setShowRequestSettingsModal(false); // istek ayarlar menüsünü kapatıyoruz
                        biryerSeçipİptalEdildiğinde(); // iptal edildiğinde gerçekleşecek işlemleri içeren fonksiyonu çağırıyoruz
                    }} />
            }
            {
                // eğer sana uygun paylaşımlı kulanıcı bulduk arayüzü göstermemiz isteniyorsa gösteriyoruz
                showMatchingRequestModal && <MatchingRequestModal
                    userData={matchingRequest.user} // bulunan paylaşımlı isteğin bilgilerini veriyoruz
                    onAccept={() => { // eğer paylaşımlı gidiş kabul edilirse bu fonksiyon çağrılıyor
                        Database
                            .isteğeKatıl({ // şuanki kullanıcıyı olan bir isteğe ekleme fonksiyonunu çağırıyoruz
                                matchingRequestId: matchingRequest.id, // bize uyan isteğin id si
                                type: type, // gidiş tipimiz
                                onlySameGender: onlySameGender, // sadece ayni cinsiyet
                                start: region, // başlangıç konumu
                                end: destination, // hedef konumu
                                distance: distance, // gidiş mesafesi
                                duration: duration, // gidiş süresi
                                destinationAddress: destinationAddress // gidiş adresi
                            })
                            .then(() => {
                                // ekledikten sonra sana uygun paylaşımlı kullanıcı bulduk arayüzünü kapatıyoruz
                                setShowMatchingRequestModal(false);
                            })
                            .catch(error => console.error(error)); // hata varsa yazdırıyoruz
                    }} onReject={() => { // eğer paylaşımlı kullanıcıya katılma isteği reddedilirse bu fonksiyon çağrılıyor
                        kullanıcınınKendiİsteğiniOluştur({ type, onlySameGender }); // kullanıcının kendi isteğini oluşturma fonksiyonunu çağırıyoruz
                    }} />
            }
            {
                // eğer puan verilecek kullanıcılar varsa o kullanıcılara puan verme arayüzünü gösteriyoruz
                (userData.usersToRate && userData.usersToRate.length > 0) && <RateUser userIds={userData.usersToRate} />
            }
            <ChangeUser
                onPress={() => { setLoading(true); }} // alttaki kullanıcı test menüsü arayüzünü gösteriyoruz ve tıklandığında yükleniyor ekranını gösteriyoruz
            />
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