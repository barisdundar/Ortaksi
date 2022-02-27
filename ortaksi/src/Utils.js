import geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_APIKEY } from './Consts';

// uygulama genelinde kullanılan çeşitli hesap ve başka fonksiyonları içeren dosya

// verilen km mesafe için taksi ücretini hesaplıyor
// başlangıç ücreti 5.55
// km başı 3.45
// minimum 15 tl
// noktadan sonra 2 basamak küsüratlı (toFixed sayesinde)
export function mesafeİçinÜcretHesapla(mesafe) {
    return Math.max((5.55 + 3.45 * mesafe), 15).toFixed(2)
}

// gps den konumumuzu bulacak şeye vereceğimiz ayarlar
const geocoderOptions = {
    timeout: 5000, // 5 saniye içinde bulmalı
    enableHighAccuracy: true, // konumumuzu yüksek tutarlılık ile bulmalı yani çok düzgün bulmalı
    maximumAge: 1000,
};

// telefonun şuanki konumunu bulan fonksiyon
export function gpsKonumÇek() {
    return new Promise((resolve, reject) => {
        // şuanki konumumuzu (enlem, boylam) alıyoruz
        geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                return resolve({ latitude, longitude }) // bulduğumuz konumu döndürüyoruz
            },
            error => reject(error), // hata varsa yazdırıyoruz
            geocoderOptions, // konumumuzu bulurken nelere göre bulacağımızı veriyoruz (en çok kaç saniye arıcaz konumumuzu, konumumuz çok düzgün bulunmalı mı gibi)
        );
    })
}

// verilen iki tarih arasında kaç dakika olduğunu döndüren fonksiyon
export function ikiTarihArasındakiDakikaFarkınıBul(dateA, dateB) {
    let diff = (dateA.getTime() - dateB.getTime()) / 1000; // iki tarihi çıkarıp 1000 e bölüyoruz çünkü milisaniye cinsinden çıkarıyoruz birbirinden, milisaniyeyi saniyeye çeviriyoruz
    diff = diff / 60; // saniyeyi de 60 a bölerek kaç dakika olduğunu buluyoruz
    return Math.abs(Math.round(diff)); // yuvarlayıp mutlak değerini alıp döndürüyoruz iki tarih arasında negatif dakika çıkmasın diye
}

// iki konum arasındaki mesafeyi metre cinsinden bulan fonksiyon
// bulurken google maps deki distancematrix servisine web isteği yapıyor ordan gelen cevabı kullanıyor
export async function getDistanceBetween(posA, posB) {
    const url = "https://maps.googleapis.com/maps/api/distancematrix/json?" + new URLSearchParams({
        key: GOOGLE_MAPS_APIKEY, // isteği yaparken kullanacağımız api keyi veriyoruz
        origins: `${posA.latitude},${posA.longitude}`, // ilk konumu veriyoruz
        destinations: `${posB.latitude},${posB.longitude}` // ikinci konumu veriyoruz
    });
    const body = await fetch(url); // dönen sonuç
    const jsonData = await body.json(); // dönen sonucun json hali

    return jsonData.rows[0].elements[0].distance.value; // dönen sonucun içinden gidip mesafe verisini alıyoruz internetten bulduk
}