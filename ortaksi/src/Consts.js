// bu dosya uygulama genelinde kullanılan sabit değişkenleri tutuyor

export const startDistanceLimit = 1500; // başlangıç konumu içinde paylaşımlı kullanıcı aranacak mesafe metre cinsinden
export const endDistanceLimit = 500; // bitiş konumu içinde paylaşımlı kullanıcı aranacak mesafe metre cinsinden
export const GOOGLE_MAPS_APIKEY = 'AIzaSyB8OJUf6Ptok29cU2shBfSq7tXpgnMfyjc'; // google cloud console den aldığımız api key, google maps işlemleri için kullanılıyor
export const randevuLastCancelMinute = 60; // randevu nun en son iptal edilebileceği dakika (örn: son 60 dakikaya kadar iptal edilebilir)
export const testUsers = [ // test kullanıcı hesapları, bu kullanıcılara email doğrulaması sorulmuyor plaka doğrulaması sorulmuyor
    "kullanicia@kullanicia.com",
    "kullanicib@kullanicib.com",
    "sofora@sofora.com",
    "soforb@soforb.com",
    "tester@test.com",
    "tester@gmail.com"
];
export const testUserRegions = { // test kullanıcılarının konumları
    "kullanicia@kullanicia.com": { // kullanıcı emaili
        region: {
            "latitude": 41.042171, // enlem
            "latitudeDelta": 0.0143,
            "location": null,
            "longitude": 28.997269, // boylam
            "longitudeDelta": 0.0134
        }
    },
    "kullanicib@kullanicib.com": { // kullanıcı emaili
        region: {
            "latitude": 41.043591, // enlem
            "latitudeDelta": 0.0143,
            "location": null,
            "longitude": 29.000542, // boylam
            "longitudeDelta": 0.0134
        }
    },
    "sofora@sofora.com": { // kullanıcı emaili
        region: {
            "latitude": 41.042264, // enlem
            "latitudeDelta": 0.0143,
            "location": null,
            "longitude": 29.001528, // boylam
            "longitudeDelta": 0.0134
        }
    },
    "soforb@soforb.com": { // kullanıcı emaili
        region: {
            "latitude": 41.045448, // enlem
            "latitudeDelta": 0.0143,
            "location": null,
            "longitude": 29.003020, // boylam
            "longitudeDelta": 0.0134
        }
    }
};