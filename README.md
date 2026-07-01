# 🏠 HousingEstateManagement (Site Yönetim Sistemi)

[![Generic badge](https://img.shields.io/badge/Backend-.NET%209.0%20Web%20API-blue.svg?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![Generic badge](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TS%20%7C%20Vite-61dafb.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Generic badge](https://img.shields.io/badge/Database-SQL%20Server-red.svg?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/en-us/sql-server)
[![Generic badge](https://img.shields.io/badge/Architecture-Clean%20Architecture-green.svg?style=for-the-badge)](#-mimari-tasarim-ilkeleri)

![Proje Ana Paneli](https://i.hizliresim.com/s7k5dda.png)


**HousingEstateManagement**, kurumsal düzeyde, modern ve kapsamlı bir Site Yönetim Sistemidir. Uygulama; **Clean Architecture (Temiz Mimari)** ilkelerine sıkı sıkıya bağlı kalınarak inşa edilmiş güçlü bir **.NET 9 Web API** backend yapısından ve **React 19**, **TypeScript**ile **Tailwind CSS** teknolojileriyle geliştirilmiş yüksek performanslı bir frontend mimarisinden oluşmaktadır.

Proje; blok/daire yerleşimleri, sakin dizini, otomatik finansal operasyonlar, çevrimiçi demokratik seçimler ve duyuru panoları gibi güçlü özellikler sunarak toplu konut sitelerinin günlük operasyonlarını kolaylaştırmak ve optimize etmek amacıyla tasarlanmıştır.

---

## 🚀 Öne Çıkan Özellikler

### 🔐 Gelişmiş Rol Bazlı Erişim Kontrolü (RBAC) ve Veri İzolasyonu
Sistem, farklı kullanıcı rolleri arasında veri gizliliğini ve hedeflenmiş yetkilendirmeyi garanti altına alan "çok kiracılı" (multi-tenant) mimari prensiplerine uygun olarak geliştirilmiştir:
*   **Site Yöneticisi (Super Admin):** Tüm site üzerinde en üst düzey kontrol ve yönetim yetkisine sahiptir. Tüm siteye, belirli bir bloğa veya yalnızca personellere özel spesifik duyurular oluşturabilir.
*   **Blok Yöneticisi (Block Admin):** Yönetim hakları, *yalnızca* sorumlu olduğu blok ile izole edilmiştir. Kendi bloğuna ait temel bilgileri düzenleyebilir ve yalnızca kendi bloğundaki sakinlere ve blok personeline duyuru gönderebilir.
*   **Blok Sakini (Daire Sahibi / Kiracı):**
    *   **Finansal İzolasyon:** Yalnızca kendi yaşadığı bloğun kasasını (gelir-gider dökümlerini) görüntüleyebilir. Diğer blokların finansal verilerine kesinlikle erişemez.
    *   **İnteraktif Katılım:** Site genelini kapsayan oylamaların yanı sıra, yalnızca kendi bloğunu ilgilendiren özel oylamalara katılabilir.

![Rol ve Yetki Akışı](*resim*)


### 🏢 Blok & Daire Yönetimi
* Fiziksel yerleşim yapılarını (Bloklar ve bağımsız Daireler) esnek bir şekilde yapılandırın.
* Site sakinlerini, ilgili dairelere "Ev Sahibi" veya "Kiracı" rolleriyle eşleştirin.

### 👥 Sakin & Kiracı Kayıt Sistemi
* Detaylı kullanıcı profilleri ve roller içeren eksiksiz bir sakinler dizini yönetin.
* Rol tabanlı erişim kontrolü (RBAC) ile sistem yetkilerini sınırlandırın (Yönetici, Sakin, Yönetim Kurulu Üyesi).

### 💰 Finansal Yönetim & Otomatik Aidat Süreçleri
* **Otomatik Aidat İşleyici:** Arka planda çalışan zamanlanmış servisler (`FinancialBackgroundService`), belirlenen şablonlara göre her ay otomatik olarak aidatları oluşturur ve dağıtır.
* **Çift Defterli Kasa Havuzları:** Gelir ve gider işlemlerini Bloklara özel kasalar ve Genel/Merkez site havuzları olarak ayrı ayrı takip edin.
* Detaylı işlem makbuzları, fatura durumları ve bakiye geçmişi günlükleri (loglama).

![Finansal Kasa Modülü](https://i.hizliresim.com/2g8q6oi.png)
*(Buraya aidatların veya kasa gelir/gider listesinin göründüğü ekranın resmini koyabilirsin)*

### 🗳️ Demokratik Dijital Seçimler
* Site yönetimi, denetçiler veya özel kararlar/önergeler için seçimler oluşturun.
* Aday listelerini yapılandırın ve sakinlerin dijital olarak oy kullanmasını sağlayın.
* **Oy Bütünlüğü Koruması:** Veritabanı seviyesindeki benzersiz bileşik anahtar (composite key) kısıtlaması sayesinde mükerrer (çift) oy kullanımını kesin olarak engeller.
* **Otomatik Sonuçlandırma:** Arka plan görevleri (`ElectionBackgroundService`), seçim süresi dolduğunda sonuçları otomatik olarak hesaplar, seçimi kapatır ve yayınlar.

![Seçim ve Oylama Ekranı](https://i.hizliresim.com/ne970vp.png)


### 📢 Toplu Duyurular
* Site genelinde duyurular yayınlayın veya duyuruları belirli bloklara göre filtreleyin.
* Zengin metin (rich text) içerikli bildirimleri, kullanıcılar sisteme giriş yaptığı an ana ekranda gösterin.

### 📊 Gerçek Zamanlı Analitik Paneli
* Ödenmemiş aidatlar, toplam nakit havuzu, adayların oy oranları, aktif duyurular ve sakinlerin dağılımı gibi özet istatistikleri tek bir ekranda izleyin.

---

## 🏗️ Mimari & Tasarım İlkeleri

### Backend Mimarisi (Clean Architecture)
Arka plan projesi, iş mantığını (business logic) kullanılan framework ve harici kütüphanelerden tamamen ayırmak amacıyla **Clean Architecture** kurallarına titizlikle uymaktadır.

