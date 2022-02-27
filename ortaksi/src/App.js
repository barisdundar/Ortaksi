import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { testUsers } from './Consts';
import CustomerNavigator from './navigators/CustomerLoggedIn';
import DriverNavigator from './navigators/DriverLoggedIn';
import NotLoggedInNavigator from './navigators/NotLoggedIn';
import PlateNotVerified from './screens/driver/PlateNotVerified';
import Loading from './screens/Loading';
import VerifyYourEmail from './screens/VerifyYourEmail';
import useIsMounted from './useIsMounted';

export default function App() {
	const isMounted = useIsMounted(); // komponent ekranda varmı yokmu ona ulaşmak için, yokken işlem yapınca hata oluşmaması için
	const [loading, setLoading] = useState(true); // bu sayfa yükleniyor mu
	const [user, setUser] = useState(); // aktif olarak giriş yapmış kullanıcı
	const [userType, setUserType] = useState(); // aktif olarak giriş yapmış kullanıcının tipi
	const [userData, setUserData] = useState(); // aktif olarak giriş yapmış kullanıcının veritabanından aldığımız verisi

	// aktif olarak giriş yapmış kullanıcı değiştiğinde
	// gelen user parametresi yeni giriş yapmış kullanıcı oluyor
	function onAuthStateChanged(user) {
		console.log('>> onAuthStateChanged') // konsola öylesine yazdırıyoruz
		console.log(user) // öylesine yazdırıyoruz
		if (isMounted.current) { // eğer bu arayüz hala varsa/ekrandaysa
			setUser(user); // giriş yapmış kullanıcıyı değiştiriyoruz
		}
	}

	// bu App ekrana çıktığında çağrılıyor ve ekrandan silindiğinde de return deki subscriber çağrılıyor
	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged); // kullanıcı değişirse diye abone oluyoruz

		return subscriber; // bu komponent ekrandan giderken yani silinirken aboneliğimizi de kaldırıyoruz çünkü artık gerek yok
	}, []); // boş dizi verince sadece bu komponent mount yani oluşturulduğunda (ekrana geldiğinde) çağrılıyor return değeri ise komponent ekrandan giderken yani unmount olurken çağrılıyor

	// aşağıda [user] şeklinde belirttiğimiz için bu useEffect sadece user state si değiştiğinde çağrılıyor
	useEffect(() => {
		if (user) { // eğer değişen kullanıcı varsa (null) değilse çünkü çıkış yapıldığında null olarak değişiyor
			const subscriber = firestore() // veritabanında
				.collection('users') // kullanıcılarda
				.doc(user.uid) // bu kullanıcının idsindeki dökümana ulaşıyoruz
				.onSnapshot((doc) => { // olacak değişikliklere abone oluyoruz, her değişiklik olduğunda bu fonksiyon tekrar çağrılıyor yeni veriyle
					const data = doc.data(); // veriyi alıyoruz
					console.log(">> user.onSnapshot"); // öylesine yazdırıyoruz
					console.log(data); // öylesine yazdırıyoruz

					if (isMounted.current) { // eğer bu ekran hala varsa/ekrandaysa (değilken işlem yapınca hata veriyor)
						setUserData(data); // aktif kullanıcının verisini tutan state i değiştiriyoruz
						setUserType(data.type); // aktif kullanıcının tipini değiştiriyoruz

						if (loading) { // eğer yükleniyorsa
							setLoading(false); // yüklenmiyor olarak değiştiriyoruz
						}
					}
				})

			return subscriber;
		}
		else { // eğer yeni kullanıcı null ise
			if (isMounted.current) { // eğer bu ekran hala varsa/ekrandaysa (değilken işlem yapınca hata veriyor)
				setLoading(false); // yüklenmiyor olarak değiştiriyoruz
			}
		}
	}, [user]); // [user] şeklinde belirttiğimiz için sadece user state si değiştiğinde bu useEffect çağrılıyor

	if (loading) { // eğer yükleniyorsa
		return <Loading /> // yükleniyor döndürüyoruz
	}

	// eğer aktif kullanıcı varsa giriş yapmış bi kullanıcı varsa
	if (user != null) {
		// eğer aktif kullanıcının emaili doğrulanmadıysa ve bu kullanıcı test kullanıcılarının içinde yoksa (test kullanıcılarına mail doğrulaması sormuyoruz)
		if (user.emailVerified == false && !testUsers.includes(user.email)) {
			return <VerifyYourEmail /> // mailini doğrula ekranını gösteriyoruz
		}
		// eğer aktif kullanıcı bir şoförse ve aktif kullanıcının plakası doğrulanmadıysa
		if (userType === 'driver' && userData.plateVerified == false) {
			return <PlateNotVerified /> // plakanın bir admin tarafından doğrulanmasını beklemen gerek ekranını gösteriyoruz
		}
	}


	// navigation konteynerlerimizi döndürüyoruz
	// eğer aktif kullanıcı varsa ve aktif kullanıcı müşteriyse müşterinin gezebileceği sayfaları içeren konteyneri
	// eğer kullanıcı müşteri değilse şoförün gezebileceği sayfaları içeren konteyneri 
	return (
		<NavigationContainer>
			{
				user ? // eğer kullanıcı varsa
					(
						userType === "customer" ? // bu parantezli kısım dönüyor, burda eğer kullanıcının tipi müşteriyse
							<CustomerNavigator /> // müşteri konteynerini döndürüyoruz
							:
							<DriverNavigator /> // değilse şoför konteynerini döndürüyoruz
					)
					:
					<NotLoggedInNavigator /> // eğer kullanıcı yoksa giriş yapılmamış sayfalar konteynerini döndürüyoruz (giriş, kaydol vs)
			}
		</NavigationContainer>
	);
}
