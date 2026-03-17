/**
 * Sinerji Site Yönetim Sistemi - Core Frontend Logic
 * Mimari: Vanilla JS (Modülsüz düz yapı, ancak mantıksal olarak ayrıştırılmış)
 */

const BASE_URL = 'http://localhost:5294/api';

// Global Modal Aç/Kapat Fonksiyonları (HTML içinden de çağırılabilsin diye)
window.openModal = function (modalId) {
    document.getElementById(modalId).classList.add('active');
};

window.closeModal = function (modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Formları sıfırla
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();

    // Gizli wrapperları gizle
    const wrappers = document.querySelectorAll(`#${modalId} .input-group[id$="BlockWrapper"]`);
    wrappers.forEach(w => w.style.display = 'none');
};

// Modal disina tiklaninca kapanma özelliği
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        window.closeModal(e.target.id);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. GLOBAL STATE (Uygulama Durumu)
    // Oturum açan kullanıcının bilgilerini ve aktif sekmeyi burada tutuyoruz.
    const AppState = {
        user: null, // Örn: { id: 1, name: 'Ahmet', role: 1, blockId: 2 }
        token: null, // JWT Token (Backend hazır olduğunda dolacak)
        currentView: 'dashboard'
    };

    const getRoleName = (roleId) => {
        switch (roleId) {
            case 1: return 'Site Yöneticisi';
            case 2: return 'Site Md. Yrd.';
            case 3: return 'Apartman Yöneticisi';
            case 4: return 'Kat Maliki / Ev Sahibi';

            case 5: return 'Kiracı';
            case 6: return 'Saha Görevlisi';
            case 7: return 'Blok Görevlisi';
            default: return 'Sistem';
        }
    };

    // 2. DOM ELEMENTLERİNİ SEÇME
    // Login Ekranı Elementleri
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');

    // Sidebar ve Navigasyon Elementleri
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');
    const btnLogout = document.getElementById('btn-logout');

    // Kullanıcı Profil Bilgi Alanları
    const userFullName = document.getElementById('user-fullname');
    const userRoleBadge = document.getElementById('user-role-badge');
    const welcomeName = document.getElementById('welcome-name');

    // 3. BAŞLANGIÇ UYGULAMA KONTROLLERİ (INIT)
    function initApp() {
        // Tarayıcı hafızasında (localStorage) token var mı kontrol et
        const savedToken = localStorage.getItem('sinerji_token');
        const savedUser = JSON.parse(localStorage.getItem('sinerji_user'));

        if (savedToken && savedUser) {
            // Oturum zaten açıksa doğrudan uygulamaya geç
            AppState.token = savedToken;
            AppState.user = savedUser;
            showApp();
        } else {
            // Oturum yoksa login ekranını göster ve blokları backend'den (mock) çek
            loadBlocksForLogin();
        }
    }

    // 4. LOGİN (GİRİŞ) İŞLEMLERİ
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle

        const blockId = document.getElementById('blockId').value;
        const aptNo = document.getElementById('apartmentNumber').value;
        const password = document.getElementById('password').value;

        try {
            console.log(`Giriş yapılıyor... API'ye istek atılıyor.`);

            const bodyData = {
                blockId: parseInt(blockId) || null,
                apartmentNumber: parseInt(aptNo) || null,
                password: password
            };

            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) {
                alert('Giriş başarısız. Lütfen bilgilerinizi (Blok, Daire No, Şifre) kontrol ediniz.');
                return;
            }

            const data = await response.json();

            // State'e kaydet ve LocalStorage'a yaz
            AppState.user = data.user;

            // Seçili bloğun adını user nesnesine ekle
            // Seçili bloğun adını user nesnesine ekle
            const blockSelect = document.getElementById('blockId');
            if (blockSelect && blockSelect.selectedIndex > -1) {
                const selectedText = blockSelect.options[blockSelect.selectedIndex].text;
                // Metin "ID - Name" formatında (Örn: "1 - Site Yönetimi")
                const blockNameOnly = selectedText.split(' - ')[1] || selectedText;
                AppState.user.blockName = blockNameOnly;
            }

            AppState.token = data.token;
            localStorage.setItem('sinerji_token', data.token);
            localStorage.setItem('sinerji_user', JSON.stringify(AppState.user));

            console.log("Giriş Başarılı. Kullanıcı Bloğu:", AppState.user.blockId);

            showApp();

        } catch (error) {
            alert('Sunucuya bağlanılamadı. API http://localhost:5000 adresinde ayakta mı?');
            console.error(error);
        }
    });

    // Çıkış Yap Butonu
    btnLogout.addEventListener('click', () => {
        // Hafızayı temizle ve state'i sıfırla
        localStorage.removeItem('sinerji_token');
        localStorage.removeItem('sinerji_user');
        AppState.token = null;
        AppState.user = null;

        // Sayfayı tamamen yenileyerek kalıntıları temizle
        location.reload();
    });

    // Login Ekranındaki Blok Seçim Kutusunu Doldur
    async function loadBlocksForLogin() {
        const blockSelect = document.getElementById('blockId');

        try {
            const response = await fetch(`${BASE_URL}/blocks`);
            const data = await response.json();

            blockSelect.innerHTML = '<option value="" disabled selected>Blok Seçin...</option>';

            data.forEach(b => {
                const option = document.createElement('option');
                option.value = b.id;
                option.textContent = `${b.id} - ${b.name}`;
                blockSelect.appendChild(option);
            });
        } catch (error) {
            console.error('API bağlantı hatası:', error);
            blockSelect.innerHTML = '<option value="" disabled selected>Bağlantı Kurulamadı!</option>';
        }
    }

    // 5. UYGULAMA ARAYÜZÜNÜ (SPA) BAŞLATMA VE YÖNETME
    function showApp() {
        // Ekran görünürlüğünü ayarla
        loginContainer.classList.remove('active');
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');

        // Profil alanlarını doldur
        userFullName.textContent = `${AppState.user.firstName} ${AppState.user.lastName}`;
        welcomeName.textContent = AppState.user.firstName;
        userRoleBadge.textContent = AppState.user.roleName;

        // Rol rengini ayarla
        userRoleBadge.className = 'badge'; // Sıfırla
        if (AppState.user.role === 1 || AppState.user.role === 2) userRoleBadge.classList.add('badge-manager'); // Yönetici
        else if (AppState.user.role === 4) userRoleBadge.classList.add('badge-owner'); // Ev Sahibi
        else userRoleBadge.classList.add('badge-tenant'); // Kiracı

        // Menü Görünürlükleri (Sadece Site Yöneticilerine özel menü öğeleri)
        const siteOnlyMenus = document.querySelectorAll('.user-role-site-only');
        siteOnlyMenus.forEach(el => {
            el.style.display = AppState.user.role === 1 ? 'flex' : 'none';
        });

        // Menü geçişlerini (Routing) dinle
        setupNavigation();

        // İlk ekranı (Dashboard) yükle
        loadDashboardData();
    }

    // Menü (Sidebar) Tıklama Olayları 
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Aktif sınıfını değiştir (Menü UI)
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Hedef id'yi al
                const targetViewId = item.getAttribute('data-target');
                AppState.currentView = targetViewId;

                // Tüm sayfaları gizle, sadece hedef sayfayı göster
                views.forEach(v => {
                    v.classList.remove('active');
                    v.classList.add('hidden');
                });
                const viewToShow = document.getElementById(`view-${targetViewId}`);
                viewToShow.classList.remove('hidden');
                viewToShow.classList.add('active');

                // Sayfaya özel verileri yükle (Sayfa geçişinde tekrar API isteği atılabilir)
                if (targetViewId === 'financials' && !window.pendingFinancialFilter) {
                    window.pendingFinancialFilter = 'all';
                }
                routeToView(targetViewId);
            });
        });
    }

    // Sayfa Router'ı: Hangi sekmeye tıklandıysa ilgili fonksiyonu çalıştır
    function routeToView(viewId) {
        switch (viewId) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'elections':
                loadElectionsData();
                break;
            case 'financials':
                loadFinancialsData();
                break;
            case 'announcements':
                loadAnnouncementsData();
                break;
            case 'block-management':
                loadBlockManagementData();
                break;
            case 'residents':
                loadResidentsData();
                break;
        }
    }

    // Dashboard'dan Sakinler menüsüne özel filtreyle geçiş
    window.goToResidentsWithFilter = function (filterValue) {
        const residentsMenuOpt = document.querySelector('.nav-item[data-target="residents"]');
        if (residentsMenuOpt) {
            residentsMenuOpt.click(); // Yönlendirmeyi tetikle
            setTimeout(() => {
                if (filterValue === 'site-management') {
                    const blockDrop = document.getElementById('residents-block-filter');
                    if (blockDrop) blockDrop.value = 'site-management';
                    const filterDropdown = document.getElementById('residents-filter');
                    if (filterDropdown) filterDropdown.value = 'all';
                } else {
                    const filterDropdown = document.getElementById('residents-filter');
                    if (filterDropdown) filterDropdown.value = filterValue;
                    const blockDrop = document.getElementById('residents-block-filter');
                    if (blockDrop) blockDrop.value = 'all';
                }
                window.filterResidentsList(); // Filtreyi manuel tetikle
            }, 200);
        }
    };

    // Bloklar'dan Sakinler menüsüne, tıklanan bloğun filtresiyle geçiş
    window.goToResidentsWithBlockFilter = function (blockName) {
        const residentsMenuOpt = document.querySelector('.nav-item[data-target="residents"]');
        if (residentsMenuOpt) {
            residentsMenuOpt.click(); // Sayfaya geç
            setTimeout(() => {
                const blockDrop = document.getElementById('residents-block-filter');
                if (blockDrop) {
                    // Dropdown değerlerini kontrol et, eşleşen varsa seç.
                    // Timeout ile loadResidentsData'nın dropdownı doldurmasını da beklemiş oluyoruz.
                    for (let option of blockDrop.options) {
                        if (option.text === blockName) {
                            blockDrop.value = option.value;
                            break;
                        }
                    }
                    window.filterResidentsList();
                }
            }, 300);
        }
    };


    // Blok detayından finansal verilere hızlı geçiş
    window.goToBlockPoolFinancials = function (blockId) {
        const finNavItem = document.querySelector('.nav-item[data-target="financials"]');
        if (finNavItem) {
            finNavItem.click();
            window.pendingFinancialFilter = 'block_' + blockId;
        }
    };

    // Yöneticilerin Blok ekranından detaya gidişi
    window.viewBlockFinancials = function (blockId) {
        // Global pending filter state for race condition düzeltmesi
        window.pendingFinancialFilter = 'block_' + blockId;

        // Finans sekmesine geç
        const finNavItem = document.querySelector('.nav-item[data-target="financials"]');
        if (finNavItem) {
            finNavItem.click();
        }
    };

    // Site Kasası Filtresiyle Finans'a Yönlendir
    window.goToSitePoolFinancials = function () {
        const finNavItem = document.querySelector('.nav-item[data-target="financials"]');
        if (finNavItem) {
            // Global pending filter state for race condition düzeltmesi
            window.pendingFinancialFilter = 'site_pool';
            finNavItem.click();
        }
    };

    // --> Dashboard Yükleme
    async function loadDashboardData() {
        try {
            const role = AppState.user.role;
            const blockId = (AppState.user.blockId !== undefined && AppState.user.blockId !== null) ? AppState.user.blockId : '';
            const res = await fetch(`${BASE_URL}/dashboard/summary?role=${role}&blockId=${blockId}`);
            if (!res.ok) throw new Error("Dashboard fetch failed");

            const data = await res.json();

            document.getElementById('site-pool-balance').textContent = `${data.poolBalance.toLocaleString('tr-TR')} ₺`;

            const resEl = document.getElementById('total-residents');
            if (resEl) resEl.textContent = `${data.totalResidents || 0} Kişi`;

            const staffEl = document.getElementById('total-staff');
            if (staffEl) staffEl.textContent = `${data.totalStaff || 0} Kişi`;

            if (role === 1 || role === 2) {
                const headerObj = document.getElementById('welcome-name');
                if (headerObj) headerObj.innerHTML = `${AppState.user.firstName} ${AppState.user.lastName} <span style="font-size: 0.9rem; font-weight: normal; margin-left:10px; padding: 4px 8px; border-radius:12px; background:rgba(0,0,0,0.1); color:var(--text-secondary);">(Site Yönetim Ekibi)</span>`;
            } else if (role === 3) {
                const headerObj = document.getElementById('welcome-name');
                const blockNameDisplay = AppState.user.blockName ? AppState.user.blockName : "Belirli Bir Blok";
                if (headerObj) headerObj.innerHTML = `${AppState.user.firstName} ${AppState.user.lastName} <span style="font-size: 0.9rem; font-weight: normal; margin-left:10px; padding: 4px 8px; border-radius:12px; background:rgba(0,0,0,0.1); color:var(--text-secondary);">(${blockNameDisplay} Yöneticisi)</span>`;

                const residentsTitle = resEl.closest('.stat-card')?.querySelector('h3');
                if (residentsTitle) residentsTitle.textContent = 'Toplam Blok Sakini';

                const staffTitle = staffEl.closest('.stat-card')?.querySelector('h3');
                if (staffTitle) staffTitle.textContent = 'Blok Görevli ve Personeli';

                // YENİ UYGULAMA: Site Kasası yerine Blok Kasası yapılandırması
                const poolBalanceEl = document.getElementById('site-pool-balance');
                if (poolBalanceEl) {
                    const poolCard = poolBalanceEl.closest('.stat-card');
                    if (poolCard) {
                        const poolTitle = poolCard.querySelector('h3');
                        if (poolTitle) poolTitle.textContent = 'Blok Kasası';
                        poolCard.removeAttribute('onclick');
                        poolCard.onclick = () => window.goToBlockPoolFinancials(AppState.user.blockId);
                    }
                }

                // Ekranda halihazırda var olan glass-panel bloklarını gizle/göster
                // HTML içindeki satırlarda onclick="window.goToResidentsWithFilter('all')" ve 'site-management' var. 
                // Bunları javascript üzerinden yakalayarak role==3 ise eziyoruz.
                if (resEl) {
                    const residentsCard = resEl.closest('.stat-card');
                    if (residentsCard) {
                        residentsCard.removeAttribute('onclick'); // Varsayılanı kaldır
                        residentsCard.onclick = () => window.goToResidentsWithFilter('all');
                    }
                }

                if (staffEl) {
                    const staffCard = staffEl.closest('.stat-card');
                    if (staffCard) {
                        staffCard.removeAttribute('onclick'); // Varsayılanı kaldır
                        staffCard.onclick = () => window.goToResidentsWithFilter('staff');
                    }
                }
            }

            const blocksEl = document.getElementById('total-blocks');
            if (blocksEl && data.totalBlocks !== undefined) {
                blocksEl.textContent = `${data.totalBlocks} Blok`;
            }

            // Aktif oylamaları listele (kutunun içine)
            const elecContainer = document.getElementById('active-elections-list');
            elecContainer.innerHTML = '';
            if (data.activeElections.length === 0) {
                elecContainer.innerHTML = '<p style="color:var(--text-secondary)">Devam eden oylama yok.</p>';
            } else {
                data.activeElections.forEach(e => {
                    elecContainer.innerHTML += `
                        <li onclick="document.querySelector('[data-target=\\'elections\\']').click()" style="padding: 12px; border: 1px solid var(--border-color); border-left: 4px solid var(--primary-color); border-radius: 6px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s ease; background: var(--bg-color);" onmouseover="this.style.background='var(--hover-bg)';" onmouseout="this.style.background='var(--bg-color)';">
                            <strong style="display:block; font-size: 1rem; color:var(--text-color); margin-bottom: 4px;">${e.title}</strong>
                            <div style="font-size:0.8rem; color:var(--text-secondary);">
                                <i class='bx bx-time'></i> Bitiş: ${e.endDate}
                            </div>
                        </li>
                    `;
                });
            }

            // Tabloyu güncelle
            const tbody = document.getElementById('recent-transactions-tbody');
            tbody.innerHTML = '';
            data.recentTransactions.forEach(t => {
                const tr = document.createElement('tr');
                const typeText = t.transactionType === 1 ? 'Gelir' : 'Gider';
                const colorVal = t.transactionType === 1 ? 'var(--success)' : 'var(--danger)';
                const sign = t.transactionType === 1 ? '+' : '-';

                tr.innerHTML = `
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td style="color:${colorVal}">${sign}${t.amount.toLocaleString('tr-TR')} ₺</td>
                    <td>${typeText}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch (e) {
            console.error(e);
            document.getElementById('site-pool-balance').textContent = "Hata";
        }
    }

    // --> Oylamalar (Elections) Yükleme
    async function loadElectionsData() {
        const container = document.getElementById('elections-content');
        container.innerHTML = "<p>Oylamalar yükleniyor...</p>";

        // Sadece yöneticiler yeni oylama butonu görebilsin
        const newElectionBtn = document.getElementById('btn-new-election');
        if (AppState.user.role === 1 || AppState.user.role === 2 || AppState.user.role === 3) {
            newElectionBtn.style.display = 'inline-flex';
        } else {
            newElectionBtn.style.display = 'none';
        }

        try {
            // Role 1 (Site Manager) and Role 2 (Assistant Manager) see scope=1 (Everything)
            const scope = (AppState.user.role === 1 || AppState.user.role === 2) ? 1 : 2;
            const blockId = (AppState.user.blockId !== undefined && AppState.user.blockId !== null) ? AppState.user.blockId : '';
            const res = await fetch(`${BASE_URL}/election/list?scope=${scope}&blockId=${blockId}&userId=${AppState.user.id}`);
            if (!res.ok) throw new Error("Secimler alinamadi");

            const electionsList = await res.json();

            // Render fonksiyonu
            window.renderElectionsTab = function (type) {
                container.innerHTML = '';
                // Tab buton renklerini degis
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelector(`.tab-btn[data-tab='${type}']`)?.classList.add('active');

                const filtered = electionsList.filter(e => type === 'active' ? !e.isCompleted : e.isCompleted);

                if (filtered.length === 0) {
                    container.innerHTML = "<p style='color:var(--text-secondary);'>Bu kategoride oylama bulunmamaktadır.</p>";
                    return;
                }

                // Add Grid Container for Election Cards
                container.innerHTML = '<div class="elections-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;"></div>';
                const gridContainer = container.querySelector('.elections-grid');

                window.allElections = electionsList;

                // YENI UYGULAMA: Seçim oluşturma modalını Blok Yöneticileri için kısıtla
                const openElectionModalBtn = document.getElementById('btn-new-election');
                if (openElectionModalBtn) {
                    openElectionModalBtn.onclick = function (e) {
                        e.preventDefault();
                        document.getElementById('electionForm').reset();
                        document.getElementById('electionForm').removeAttribute('data-edit-id');
                        document.querySelector('#electionModal h3').textContent = 'Yeni Oylama Ekle';
                        const modalSubmitBtn = document.querySelector('#electionForm button[type="submit"]');
                        if (modalSubmitBtn) {
                            modalSubmitBtn.innerHTML = "Oluştur <i class='bx bx-plus-circle'></i>";
                        }

                        const scopeEl = document.getElementById('elecScope');
                        const targetBlockElWrapper = document.getElementById('elecBlockWrapper');
                        const targetBlockEl = document.getElementById('elecTargetBlock');

                        // Blok Yöneticisi ise modalı blok özelinde kitle
                        if (AppState.user.role === 3) {
                            if (scopeEl) {
                                scopeEl.value = "2"; // 2 = Block Scope
                                // Site level option'ını sakla ve kilidi devreye sok
                                Array.from(scopeEl.options).forEach(opt => {
                                    if (opt.value === "1") { opt.disabled = true; opt.style.display = 'none'; }
                                });
                                // User shouldn't trick the system
                                scopeEl.style.pointerEvents = 'none';
                                scopeEl.closest('.input-group').style.display = 'none'; // Kapsam seçimini tamamen gizle
                            }

                            if (targetBlockElWrapper && targetBlockEl) {
                                targetBlockElWrapper.style.display = 'none'; // Blok seçimini tamamen gizle
                                targetBlockEl.value = AppState.user.blockId;
                                targetBlockEl.style.pointerEvents = 'none';
                            }
                        } else {
                            // Diğer yöneticiler için alanları görünür yap (Olası kalıntıları temizle)
                            if (scopeEl) {
                                scopeEl.style.pointerEvents = 'auto';
                                scopeEl.closest('.input-group').style.display = 'block';
                                Array.from(scopeEl.options).forEach(opt => {
                                    if (opt.value === "1") { opt.disabled = false; opt.style.display = 'block'; }
                                });
                            }
                            if (targetBlockElWrapper && targetBlockEl) {
                                targetBlockElWrapper.style.display = 'none'; // Default hidden until Scope 2 is selected
                                targetBlockEl.style.pointerEvents = 'auto';
                            }
                        }

                        window.openModal('electionModal');
                    }
                }

                window.editElection = function (id) {
                    const e = window.allElections.find(x => x.id === id);
                    if (!e) return;

                    document.getElementById('elecTitle').value = e.title;
                    if (document.getElementById('elecDescription')) document.getElementById('elecDescription').value = e.description || '';
                    document.getElementById('elecStart').value = e.startDate;
                    document.getElementById('elecEnd').value = e.endDate;
                    document.getElementById('elecScope').value = e.scope;

                    if (AppState.user.role === 3) {
                        // Blok Yöneticisi ise yine kapsam ve blok seçimini gizli tut
                        document.getElementById('elecScope').closest('.input-group').style.display = 'none';
                        document.getElementById('elecBlockWrapper').style.display = 'none';
                        if (e.scope === 2 && e.blockId) {
                            document.getElementById('elecTargetBlock').value = e.blockId;
                        }
                    } else {
                        if (e.scope === 2 && e.blockId) {
                            document.getElementById('elecBlockWrapper').style.display = 'block';
                            document.getElementById('elecTargetBlock').value = e.blockId;
                        } else {
                            document.getElementById('elecBlockWrapper').style.display = 'none';
                        }
                    }

                    if (e.voterEligibility) {
                        document.getElementById('elecVoter').value = e.voterEligibility;
                    }

                    document.getElementById('elecType').value = e.type;
                    window.toggleElectionTypeUI();

                    if (e.type === 2) {
                        document.getElementById('elecOptions').value = e.candidates.map(c => c.fullName).join(', ');
                    } else if (e.type === 1) {
                        // Adayları seçili hale getir
                        const candSelect = document.getElementById('elecCandidates');
                        // Adaylar henüz yüklenmemişse yükleyelim (Kapsam değişimi)
                        const scopeVal = document.getElementById('elecScope').value;
                        const blockVal = document.getElementById('elecTargetBlock').value;
                        let fetchScopeVal = scopeVal;
                        let fetchBlockId = blockId;

                        // Blok Yöneticisi için her zaman kendi bloğundan aday çekmesini zorla
                        if (AppState.user.role === 3) {
                            fetchScopeVal = "2";
                            fetchBlockId = AppState.user.blockId;
                        }

                        fetch(`${BASE_URL}/election/candidates?scope=${fetchScopeVal}&blockId=${fetchBlockId}`)
                            .then(res => res.json())
                            .then(data => {
                                electionCandidatesData = data;
                                renderCandidatesList(data);
                                // Select the candidates
                                Array.from(candSelect.options).forEach(opt => {
                                    if (e.candidates.some(c => c.fullName.includes(opt.text.split(' (')[0]))) {
                                        opt.selected = true;
                                    }
                                });
                            });
                    }

                    document.getElementById('electionForm').setAttribute('data-edit-id', id);
                    document.querySelector('#electionModal h3').textContent = 'Oylamayı Güncelle (Yeni Aday/Şık Ekle)';
                    const modalSubmitBtn = document.querySelector('#electionForm button[type="submit"]');
                    if (modalSubmitBtn) modalSubmitBtn.innerHTML = 'Güncelle <i class=\'bx bx-refresh\'></i>';
                    window.openModal('electionModal');
                };

                filtered.forEach(e => {
                    let candsHtml = `<div id="elec-${e.id}-cands">`;
                    e.candidates.forEach(c => {
                        const pct = e.totalVotes === 0 ? 0 : Math.round((c.voteCount / e.totalVotes) * 100);

                        // Eğer kullanıcı bu adaya oy verdiyse yeşil (btn-success) butonu göster, yoksa standart mavi (btn-primary)
                        let voteBtn = '';
                        if (!e.isCompleted) {
                            const isEligible = e.scope === 1 || (e.scope === 2 && e.blockId === AppState.user.blockId);

                            if (e.userVotedCandidateId === c.candidateId) {
                                // Kullanıcı bu adaya oy vermişse butonu yeşil ve pasif yapıyoruz (bkz. style.css .btn-success)
                                voteBtn = `<button id="vote-btn-${c.candidateId}" onclick="window.castVote(${e.id}, ${c.candidateId})" class="btn btn-success" style="padding: 4px 10px; font-size: 0.8rem; margin-left:15px; border-radius: 4px;" disabled>Oy Verildi <i class='bx bx-check'></i></button>`;
                            } else if (!isEligible) {
                                // Kullanıcının bloğu değilse butonu pasif yap
                                voteBtn = `<button class="btn" style="padding: 4px 10px; font-size: 0.8rem; margin-left:15px; border-radius: 4px; background: rgba(0,0,0,0.1); color: var(--text-secondary); cursor: not-allowed;" disabled title="Bu oylama sizin bloğunuza ait değildir.">Farklı Blok</button>`;
                            } else {
                                // Henüz oy verilmemişse veya başka birine verilmişse 'Oy Ver' veya 'Değiştir' butonu gösteriyoruz
                                const btnText = e.userVotedCandidateId ? 'Değiştir' : 'Oy Ver';
                                voteBtn = `<button id="vote-btn-${c.candidateId}" onclick="window.castVote(${e.id}, ${c.candidateId})" class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem; margin-left:15px; border-radius: 4px;">${btnText}</button>`;
                            }
                        }

                        candsHtml += `
                            <div style="margin-bottom: 12px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:5px; align-items:center;">
                                    <span style="font-size: 0.9rem;">${c.fullName}</span>
                                    <div style="display:flex; align-items:center;">
                                        <strong style="font-size: 0.85rem;">%${pct} (${c.voteCount} Oy)</strong>
                                        ${voteBtn}
                                    </div>
                                </div>
                                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="width: ${pct}%; height: 100%; background: var(--primary-color); transition: width 1s ease;"></div>
                                </div>
                            </div>
                        `;
                    });
                    candsHtml += `</div>`;

                    // Oylamanın blok kapsamında olup olmadığını ve adını daha temiz ayarlıyoruz
                    let scopeBadgeObj = '';
                    if (e.scope === 1) {
                        scopeBadgeObj = '<span class="badge badge-manager" style="font-size: 0.70rem;">Site Geneli</span>';
                    } else if (e.scope === 2) {
                        const bName = e.blockName ? e.blockName : 'Belirli Bir Blok';
                        scopeBadgeObj = `<span class="badge badge-owner" style="font-size: 0.70rem;">${bName}</span>`;
                    }

                    const typeLabel = e.type === 1 ? 'Yönetici Seçimi' : 'Anket Oylaması';

                    let actionsHtml = '';
                    let canEditOrDelete = false;

                    if (AppState.user.role === 1 || AppState.user.role === 2) {
                        canEditOrDelete = true;
                    } else if (AppState.user.role === 3 && e.createdByRole === 3 && e.blockId === AppState.user.blockId) {
                        canEditOrDelete = true;
                    }

                    if (!e.isCompleted && canEditOrDelete) {
                        // Eğer yönetici seçimi ise güncelleme butonunu gizle (sadece silinebilir veya dokunulmaz)
                        if (e.type !== 1) {
                            actionsHtml = `<button onclick="window.editElection(${e.id})" class="btn-icon" style="color:var(--primary-color); border:none; background:none; cursor:pointer; margin-bottom: 5px;" title="Düzenle / Ekle"><i class='bx bx-edit'></i> Güncelle</button>`;
                        }
                    }

                    // Sadece Yöneticiler (Role 1 ve 2) ve Normal Anket (Type 2) için SİL butonu eklendi (Kullanıcı Talebi)
                    if (e.type === 2 && canEditOrDelete) {
                        actionsHtml += `<button onclick="window.deleteElection(${e.id})" class="btn-icon" style="color:var(--danger); border:none; background:none; cursor:pointer; margin-bottom: 5px; margin-left: 5px;" title="Anketi Sil"><i class='bx bx-trash'></i> Sil</button>`;
                    }

                    const descHtml = e.description ? `<p style="color:var(--text-secondary); font-size: 0.85rem; margin-bottom: 10px;"><i>${e.description}</i></p>` : '';

                    // Sadeleştirilmiş Etiket (Duyurulara benzer badge)
                    let creatorLabel = '';
                    if (e.createdByRole === 1 || e.createdByRole === 2) {
                        creatorLabel = '<span class="badge badge-manager" style="font-size:0.7rem; padding: 2px 8px;">Site Yönetimi</span>';
                    } else if (e.createdByRole === 3) {
                        creatorLabel = '<span class="badge badge-owner" style="font-size:0.7rem; padding: 2px 8px;">Apartman Yönetimi</span>';
                    }

                    gridContainer.innerHTML += `
                        <div class="election-card glass-panel" data-type="${e.type}" data-scope="${e.scope}" style="padding: 15px; border-top: 3px solid ${e.scope === 1 ? 'var(--primary-color)' : 'var(--warning)'}; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 10px; transition: transform 0.2s; min-height: 280px;">
                            <div style="display:flex; justify-content:space-between; align-items: flex-start; flex-shrink: 0;">
                                <div>
                                    ${creatorLabel}
                                    <h3 style="margin: 5px 0; font-size: 1.1rem; color: var(--text-color);">${e.title}</h3>
                                </div>
                                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                                    <div style="display: flex; align-items:center;">${actionsHtml}</div>
                                    <div style="display:flex; gap: 5px;">
                                        ${scopeBadgeObj}
                                        <span class="badge" style="background: rgba(255,255,255,0.05); font-size: 0.65rem; border: 1px solid var(--border-color);">${typeLabel}</span>
                                    </div>
                                </div>
                            </div>
                            
                            ${descHtml ? `<div style="background: transparent; padding: 8px 0; border-radius: 4px; font-style: italic; border-left: 2px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary);">${descHtml}</div>` : ''}
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;">
                                <span style="color:var(--text-secondary); font-size:0.75rem;"><i class='bx bx-time-five'></i> Bitiş: <strong>${e.displayEndDate}</strong></span>
                                <span style="color:var(--text-secondary); font-size:0.75rem;"><i class='bx bx-group'></i> ${e.totalVotes} Katılım</span>
                            </div>
                            
                            <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
                                ${candsHtml}
                            </div>
                        </div>
                    `;
                });
            };

            // Filter Elections Logic
            window.filterElections = function (val) {
                const cards = document.querySelectorAll('.election-card');
                cards.forEach(card => {
                    const type = card.getAttribute('data-type');
                    const scope = card.getAttribute('data-scope');

                    if (val === 'all') {
                        card.style.display = 'flex';
                    } else if (val === '1' && type === '1' && scope === '1') { // Site Yönetici Seçimi
                        card.style.display = 'flex';
                    } else if (val === '2' && type === '1' && scope === '2') { // Blok Yönetici Seçimi
                        card.style.display = 'flex';
                    } else if (val === '3' && type === '2') { // Normal Anket
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            };

            // Event Listeners for tabs (Aktif / Arşiv sekme geçişi)
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.onclick = function () {
                    window.renderElectionsTab(this.getAttribute('data-tab'));
                    // Sekme değiştiğinde var olan filtreyi koru ve tekrar uygula
                    const currentFilter = document.getElementById('election-filter')?.value || 'all';
                    window.filterElections(currentFilter);
                };
            });

            // Geliş sayfasında default olarak active olanları renderla
            window.renderElectionsTab('active');

            // Delete Election Function (For Polls Only, visible to managers)
            window.deleteElection = async function (id) {
                if (!confirm("Bu anketi tamamen silmek istediğinize emin misiniz? (Bu işlem geri alınamaz ve tüm oyları siler)")) return;
                try {
                    const res = await fetch(`${BASE_URL}/election/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        alert("Oylama/Anket silindi.");
                        loadElectionsData();
                        loadDashboardData();
                    } else {
                        alert("Silinirken bir hata oluştu veya yetkiniz yok.");
                    }
                } catch (e) { console.error(e); }
            };

            // Oy Kullanma Fonksiyonu Global
            window.castVote = async function (electionId, candidateId) {
                if (!confirm("Oyunuzu bu adaya vermek istediğinize emin misiniz?")) return;

                // Oy kullanma işlemi sırasında butonu hemen yeşile çeviriyoruz (Anlık bildirim)
                const clickedBtn = document.getElementById(`vote-btn-${candidateId}`);
                let originalHtml = '';
                if (clickedBtn) {
                    originalHtml = clickedBtn.innerHTML;

                    // Butonun CSS sınıflarını güncelleyerek yeşil olmasını sağlıyoruz
                    // Satır içi (inline) style manipülasyonu yerine CSS sınıflarını kullanıyoruz (bkz. style.css)
                    clickedBtn.className = "btn btn-success";
                    clickedBtn.innerHTML = `Oy Verildi <i class='bx bx-check'></i>`;
                    clickedBtn.disabled = true; // Tekrar tıklanmasını engelle
                }

                try {
                    const res = await fetch(`${BASE_URL}/election/vote`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ electionId: electionId, candidateId: candidateId, voterUserId: AppState.user.id })
                    });
                    if (res.ok) {
                        // Verileri anlık olarak tamamen yenile (Sayım, oranlar vs. için)
                        loadElectionsData();
                        loadDashboardData();
                    } else {
                        // Bir hata olursa butonu geri al
                        if (clickedBtn) {
                            clickedBtn.classList.remove('btn-success');
                            clickedBtn.classList.add('btn-primary');
                            clickedBtn.innerHTML = originalHtml;
                            clickedBtn.disabled = false;
                        }
                        const err = await res.text();
                        alert(err || "Oy verme işlemi başarısız.");
                    }
                } catch (e) { console.error(e); }
            };

        } catch (e) {
            console.error(e);
            container.innerHTML = "<p>Oylamalar yüklenirken hata oluştu.</p>";
        }
    }

    // --> Finans (Financials) Yükleme
    let allFinancialLedgers = [];
    async function loadFinancialsData() {
        // Sadece yöneticiler para ekleyip çıkarabilir
        const btnManual = document.getElementById('btn-manual-mng');
        const btnRecurring = document.getElementById('btn-recurring-mng');
        if (btnManual && btnRecurring) {
            if (AppState.user.role === 1 || AppState.user.role === 2 || AppState.user.role === 3) {
                btnManual.style.display = 'inline-flex';
                btnRecurring.style.display = 'inline-flex';

                btnManual.onclick = function (e) {
                    e.preventDefault();
                    document.getElementById('financialForm').reset();
                    document.getElementById('financialForm').removeAttribute('data-edit-id');
                    document.querySelector('#financialModal h3').textContent = 'Manuel Finansal İşlem (Gelir/Gider)';

                    if (AppState.user.role === 3) {
                        const finPoolEl = document.getElementById('finPool');
                        if (finPoolEl) {
                            finPoolEl.value = '2'; // Block Havuzu
                            Array.from(finPoolEl.options).forEach(opt => {
                                if (opt.value === '1') { opt.disabled = true; opt.style.display = 'none'; }
                            });
                            finPoolEl.style.pointerEvents = 'none';
                            finPoolEl.closest('.input-group').style.display = 'none';
                        }
                        const finBlockWrapper = document.getElementById('finBlockWrapper');
                        if (finBlockWrapper) finBlockWrapper.style.display = 'none';
                    } else {
                        // Reset for Site Managers
                        const finPoolEl = document.getElementById('finPool');
                        if (finPoolEl) {
                            finPoolEl.style.pointerEvents = 'auto';
                            finPoolEl.closest('.input-group').style.display = 'block';
                            Array.from(finPoolEl.options).forEach(opt => {
                                opt.disabled = false;
                                opt.style.display = 'block';
                            });
                        }
                        const finBlockWrapper = document.getElementById('finBlockWrapper');
                        if (finBlockWrapper && finPoolEl && finPoolEl.value === '2') {
                            finBlockWrapper.style.display = 'block';
                        }
                    }

                    window.openModal('financialModal');
                };

                btnRecurring.onclick = function (e) {
                    e.preventDefault();
                    window.openRecurringListModal();
                };
            } else {
                btnManual.style.display = 'none';
                btnRecurring.style.display = 'none';
            }
        }

        try {
            const blockId = (AppState.user.blockId !== undefined && AppState.user.blockId !== null) ? AppState.user.blockId : '';
            const res = await fetch(`${BASE_URL}/financial/ledgers?role=${AppState.user.role}&blockId=${blockId}`);
            if (!res.ok) throw new Error("API Hatası");

            allFinancialLedgers = await res.json();
            if (!Array.isArray(allFinancialLedgers)) allFinancialLedgers = [];

            const container = document.getElementById('financial-ledgers-container');
            if (container) container.innerHTML = '';

            // Kasa Filtresini Güncelle (Dinamik Bloklar eklensin)
            const finFilter = document.getElementById('financial-ledger-filter');
            if (finFilter) {
                // Mevcut seçim (Sayfa yenilense de seçili tutabilmek için)
                const currentSel = finFilter.value;

                let opts = '<option value="all">Tüm Kasalar</option>';
                opts += '<option value="site_pool">Sadece Site Kasası</option>';

                // Gelen ledgers içerisindeki blok kasalarını bul
                const blockLedgers = allFinancialLedgers.filter(l => l.poolType === 2);
                blockLedgers.forEach(bl => {
                    opts += `<option value="block_${bl.blockId}">${bl.poolName}</option>`;
                });

                finFilter.innerHTML = opts;

                // Eğer eskiden seçili bir değer varsa onu geri seç
                let optionExists = false;
                for (let opt of finFilter.options) {
                    if (opt.value === currentSel) optionExists = true;
                }

                if (window.pendingFinancialFilter) {
                    finFilter.value = window.pendingFinancialFilter;
                } else if (optionExists) {
                    // Sayfa yenilenmesi veya veri güncellemesi durumunda mevcut seçimi koru
                    finFilter.value = currentSel;
                } else {
                    // Hiçbir seçim yoksa "Tüm Kasalar"ı varsayılan yap
                    finFilter.value = "all";
                }
            }



            window.deleteManualTransaction = async function (id) {
                if (!confirm("Gerçekten bu işlemi (gider/gelir) silmek istiyor musunuz? (Bakiye güncellenecektir)")) return;
                try {
                    const res = await fetch(`${BASE_URL}/financial/transaction/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        alert("İşlem silindi.");
                        loadFinancialsData();
                        loadDashboardData();
                    } else alert("İşlem silinemedi.");
                } catch (e) { console.error(e); }
            };

            window.editManualTransaction = function (id, desc, amount, type, pool, blockId) {
                document.getElementById('finDesc').value = desc;
                document.getElementById('finAmount').value = amount;
                document.getElementById('finType').value = type;
                document.getElementById('finPool').value = pool;

                if (blockId) {
                    document.getElementById('finBlockWrapper').style.display = 'block';
                    // Blokları çek ve doldur, sonra seç
                    fetch(`${BASE_URL}/blocks`).then(res => res.json()).then(blocks => {
                        const sel = document.getElementById('finTargetBlock');
                        sel.innerHTML = '';
                        blocks.forEach(b => {
                            sel.innerHTML += `<option value="${b.id}" ${b.id == blockId ? 'selected' : ''}>${b.name}</option>`;
                        });
                    });
                } else {
                    document.getElementById('finBlockWrapper').style.display = 'none';
                }

                // Finans Modalında Site Kasası işlemlerinde gereksiz soruların (Hangi Kasadan?) çıkmasını sakla.
                if (AppState.user.role === 1 && pool === 1) {
                    document.getElementById('finPool').closest('.input-group').style.display = 'none';
                } else {
                    document.getElementById('finPool').closest('.input-group').style.display = 'block';
                }

                document.getElementById('financialForm').setAttribute('data-edit-id', id);
                document.querySelector('#financialModal h3').textContent = 'Manuel Finansal İşlemi Güncelle';
                window.openModal('financialModal');
            };

            allFinancialLedgers.forEach(ledger => {
                // Sadece Site Yöneticisi (Role 1) ve sadece Site Kasası (poolType 1) düzenlenebilir olsun.
                const canEdit = AppState.user.role === 1 && ledger.poolType === 1;
                const currentPool = ledger.poolType;
                const currentBlockId = ledger.blockId;

                let tbodyRows = '';
                const txs = ledger.transactions || [];
                txs.forEach(t => {
                    const typeText = t.transactionType === 1 ? 'Gelir' : 'Gider';
                    const colorVal = t.transactionType === 1 ? 'var(--success)' : 'var(--danger)';
                    const sign = t.transactionType === 1 ? '+' : '-';

                    let actionCol = '';
                    if (canEdit) {
                        const safeDesc = t.description.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                        actionCol = `
                            <td>
                                <button onclick="window.editManualTransaction(${t.id}, '${safeDesc}', ${t.amount}, ${t.transactionType}, ${currentPool}, ${currentBlockId})" class="btn-icon" style="color:var(--primary-color); border:none; background:none; cursor:pointer;" title="Düzenle"><i class='bx bx-edit'></i></button>
                                <button onclick="window.deleteManualTransaction(${t.id})" class="btn-icon" style="color:var(--danger); border:none; background:none; cursor:pointer; margin-left: 5px;" title="Sil"><i class='bx bx-trash'></i></button>
                            </td>
                        `;
                    }

                    tbodyRows += `<tr>
                        <td>#TRX-${t.id}</td>
                        <td>${t.date}</td>
                        <td>${t.description}</td>
                        <td style="color:${colorVal}">${sign}${t.amount.toLocaleString('tr-TR')} ₺</td>
                        <td>${typeText}</td>
                        ${canEdit ? actionCol : ''}
                    </tr>`;
                });

                container.innerHTML += `
                    <div class="glass-panel mt-3">
                         <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                             <h3>${ledger.poolName}</h3>
                             <h3 style="color:${ledger.balance >= 0 ? 'var(--success)' : 'var(--danger)'}">Bakiye: ${ledger.balance.toLocaleString('tr-TR')} ₺</h3>
                         </div>
                         <div class="table-responsive">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>İşlem No</th>
                                        <th>Tarih</th>
                                        <th>Açıklama</th>
                                        <th>Tutar</th>
                                        <th>Tür</th>
                                        ${canEdit ? '<th>İşlem</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${tbodyRows || '<tr><td colspan="5">Kayıt bulunamadı.</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            });
            window.filterFinancialLedgers();
            window.pendingFinancialFilter = null; // Sıfırla

        } catch (e) {
            console.error(e);
            document.getElementById('financial-ledgers-container').innerHTML = "<p>Mali veriler getirilemedi.</p>";
        }
    }

    // Finansal Filtreleme Mantığı
    window.filterFinancialLedgers = function () {
        const filterDrop = document.getElementById('financial-ledger-filter');
        let filterVal = filterDrop?.value || 'all';

        // YENİ UYGULAMA: Blok yöneticisi ise dropdownı gizle ve sadece kendi bloğunu render et
        if (AppState.user.role === 3) {
            if (filterDrop) filterDrop.style.display = 'none';
            filterVal = 'block_' + AppState.user.blockId;
        }

        const container = document.getElementById('financial-ledgers-container');
        if (!container) return;

        // Ekranda halihazırda var olan glass-panel bloklarını gizle/göster
        // Ancak biz render ederken allFinancialLedgers üzerinden tekrar render edebiliriz 
        // ya da mevcut DOM'u manipüle edebiliriz. 
        // Kullanıcının daha önce istediği 'İncele' butonuna basınca sadece o bloğun görünmesi özelliği için DOM manipülasyonu daha hızlıdır.

        const panels = container.querySelectorAll('.glass-panel');
        panels.forEach((panel, index) => {
            const ledger = allFinancialLedgers[index];
            if (!ledger) return;

            if (filterVal === 'all') {
                panel.style.display = 'block';
            } else if (filterVal === 'site_pool') {
                panel.style.display = (ledger.poolType === 1) ? 'block' : 'none';
            } else if (filterVal.startsWith('block_')) {
                const targetBlockId = filterVal.split('_')[1];
                panel.style.display = (ledger.blockId == targetBlockId) ? 'block' : 'none';
            }
        });
    };

    window.renderAnnouncementsFeed = function (announcementsToRender) {
        const list = document.getElementById('announcements-list');
        list.innerHTML = '';

        if (announcementsToRender.length === 0) {
            list.innerHTML = "<p style='color:var(--text-secondary);'>Şu an aktif bir duyuru bulunmuyor.</p>";
            return;
        }

        announcementsToRender.forEach(a => {
            let scopeBadge = '';
            if (a.scope === 1) scopeBadge = '<span class="badge badge-manager">Site Geneli</span>';
            else if (a.scope === 2) scopeBadge = `<span class="badge badge-owner">${a.blockName || 'Blok Geneli'} Sakinleri</span>`;
            else if (a.scope === 3) {
                const badgeText = a.blockName ? `${a.blockName} Görevlileri` : 'Site Geneli Görevliler';
                scopeBadge = `<span class="badge badge-staff">${badgeText}</span>`;
            }

            // Edit and Delete buttons (YENİ: Blok Yöneticisi de kendi duyurularını silebilir/düzenleyebilir)
            let actionsBtn = '';
            let creatorIdNum = a.createdByRole;
            let isAnnCreator = false;

            if (AppState.user.role === 1 || AppState.user.role === 2) {
                isAnnCreator = true; // Site yönetimi hepsine hakim
            } else if (AppState.user.role === 3 && a.createdByRole === 3 && a.scope === 2 && a.blockName === AppState.user.blockName) {
                // Blok yöneticisi, SADECE kendisinin (veya başka bir blok yöneticisi olamayacağına göre kendi bloğunun yöneticisinin) oluşturduğu duyuruları silebilir
                isAnnCreator = true;
            }

            if (isAnnCreator) {
                const safeTitle = a.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                const safeContent = a.content.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, '\\n');

                actionsBtn = `
                    <button onclick="window.editAnnouncement(${a.id}, '${safeTitle}', '${safeContent}', ${a.scope})" class="btn-icon" style="color:var(--primary-color); border:none; background:none; cursor:pointer; margin-right:5px;" title="Düzenle"><i class='bx bx-edit'></i></button>
                    <button onclick="window.deleteAnnouncement(${a.id})" class="btn-icon" style="color:var(--danger); border:none; background:none; cursor:pointer;" title="Sil"><i class='bx bx-trash'></i></button>
                `;
            }

            list.innerHTML += `
                <div class="glass-panel" style="padding: 20px; margin-bottom: 15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 15px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                        <div style="display:flex; align-items:center; gap: 10px;">
                            <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem;"><i class='bx bx-user'></i></div>
                            <div>
                                <strong style="display:block; font-size: 0.9rem; color:var(--text-color);">${a.createdBy || 'Yönetim'}</strong>
                                <span style="font-size:0.75rem; color:var(--text-secondary);">${getRoleName(a.createdByRole)} • <i class='bx bx-calendar'></i> ${a.date}</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center;">
                            ${scopeBadge}
                            <div style="margin-left: 15px;">${actionsBtn}</div>
                        </div>
                    </div>
                    <h3 style="margin-bottom: 10px; font-size: 1.1rem;">${a.title}</h3>
                    <p style="color:var(--text-secondary); white-space: pre-wrap; font-size: 0.95rem; line-height: 1.5;">${a.content}</p>
                </div>
            `;
        });
    };

    window.filterAnnouncements = function (val) {
        if (!window.allAnnouncements) return;
        if (val === 'all') {
            window.renderAnnouncementsFeed(window.allAnnouncements);
        } else {
            const scopeVal = parseInt(val);
            const filtered = window.allAnnouncements.filter(a => a.scope === scopeVal);
            window.renderAnnouncementsFeed(filtered);
        }
    };

    // Silme fonksiyonu (Global)
    window.deleteAnnouncement = async function (id) {
        if (!confirm("Duyuruyu silmek istediğinize emin misiniz?")) return;
        try {
            const dRes = await fetch(`${BASE_URL}/announcement/${id}`, { method: 'DELETE' });
            if (dRes.ok) {
                alert("Duyuru silindi!");
                loadAnnouncementsData(); // Hemen yenile
            } else alert("Silinemedi.");
        } catch (e) { console.error(e); }
    };

    // Düzenleme animasyonu
    window.editAnnouncement = function (id, title, content, scope) {
        document.getElementById('annTitle').value = title;
        document.getElementById('annContent').value = content;
        document.getElementById('annScope').value = scope;

        document.getElementById('announcementForm').setAttribute('data-edit-id', id);
        document.querySelector('#announcementModal h2') ? document.querySelector('#announcementModal h2').textContent = 'Duyuru Güncelle' : document.querySelector('#announcementModal h3').textContent = 'Duyuru Güncelle';
        window.openModal('announcementModal');
    };

    // --> Announcements (Duyurular) Yükleme
    async function loadAnnouncementsData() {
        const btnAdd = document.getElementById('btn-add-announcement');
        // YENİ UYGULAMA: Blok yöneticisi de duyuru ekleyebilsin
        if (AppState.user.role === 1 || AppState.user.role === 2 || AppState.user.role === 3) {
            btnAdd.style.display = 'inline-flex';

            // Eğer blok yöneticisiyse duyuru modalının içindeki dropdownları kitle
            if (AppState.user.role === 3) {
                btnAdd.onclick = function () {
                    const annForm = document.getElementById('announcementForm');
                    if (annForm) annForm.reset();
                    if (annForm) annForm.removeAttribute('data-edit-id');

                    const modalTitle = document.querySelector('#announcementModal h2') || document.querySelector('#announcementModal h3');
                    if (modalTitle) modalTitle.textContent = 'Yeni Duyuru Ekle';

                    const annScopeEl = document.getElementById('annScope');
                    const annBlockWrapper = document.getElementById('annBlockWrapper');
                    if (annScopeEl) {
                        annScopeEl.closest('.input-group').style.display = 'block'; // Gösterilmeli ki görevli seçebilsin
                        annScopeEl.style.pointerEvents = 'auto'; // Tıklanabilir olmalı

                        // Reset options first
                        Array.from(annScopeEl.options).forEach(opt => {
                            opt.disabled = false;
                            opt.style.display = 'block';
                            if (opt.value === "3") opt.textContent = "Bina Görevlileri";
                            if (opt.value === "2") opt.textContent = "Blok Sakinleri";
                        });

                        annScopeEl.value = '2'; // Varsayılan Blok Sakinleri
                        Array.from(annScopeEl.options).forEach(opt => {
                            if (opt.value === "1") { 
                                opt.disabled = true; 
                                opt.style.display = 'none'; 
                            }
                        });
                    }
                    if (annBlockWrapper) {
                        annBlockWrapper.style.display = 'none'; // Blok seçimini tamamen gizle
                    }

                    window.openModal('announcementModal');
                }
            }
        } else {
            btnAdd.style.display = 'none';
        }

        try {
            const blockId = (AppState.user.blockId !== undefined && AppState.user.blockId !== null) ? AppState.user.blockId : '';
            const res = await fetch(`${BASE_URL}/announcement?viewerRole=${AppState.user.role}&blockId=${blockId}`);
            if (!res.ok) throw new Error("Duyurular getirilemedi");

            let announcements = await res.json();
            // Backend zaten sirali gönderiyor (OrderByDescending)
            window.allAnnouncements = announcements;

            const filterVal = document.getElementById('announcement-filter')?.value || 'all';
            window.filterAnnouncements(filterVal);

        } catch (e) {
            console.error(e);
            document.getElementById('announcements-list').innerHTML = "<p>Duyurular yüklenirken hata oluştu.</p>";
        }
    }

    // --> Blok Yönetimi Yükleme (Sadece Site Yöneticisi)
    async function loadBlockManagementData() {
        if (AppState.user.role !== 1) return; // Güvenlik çemberi

        try {
            const res = await fetch(`${BASE_URL}/blockmanagement`);
            if (!res.ok) throw new Error("Blok Listesi Alınamadı");

            const data = await res.json();
            const tbody = document.getElementById('block-list-tbody');
            tbody.innerHTML = '';

            data.forEach(b => {
                const isNegative = b.currentBalance < 0;
                const poolColor = isNegative ? 'var(--danger)' : 'var(--success)';
                const poolSign = isNegative ? '' : '+';

                // Modern UI badges for counts
                const aptBadge = `<span class="badge" style="background: rgba(99, 102, 241, 0.1); color: #6366F1; border: 1px solid rgba(99, 102, 241, 0.2); padding: 6px 10px;">${b.totalApartments} Daire</span>`;
                const residentBadge = `<span onclick="window.goToResidentsWithBlockFilter('${b.blockName}')" class="badge click-card" style="background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); padding: 6px 10px; cursor:pointer;" title="Bu blokta oturan kişileri gör"><i class='bx bx-user'></i> ${b.activeResidents} Kişi</span>`;
                const managerAvatar = `<div style="display:flex; align-items:center; gap:10px;">
                                        <div style="width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; justify-content:center; align-items:center; border: 1px solid var(--surface-border);"><i class='bx bx-user' style="color:var(--text-secondary); font-size:1.1rem;"></i></div>
                                        <span style="font-weight:500;">${b.managerName}</span>
                                       </div>`;

                tbody.innerHTML += `
                    <tr style="transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                        <td>
                            <div style="display:flex; align-items:center;">
                                <strong style="font-size:1.1rem; color:var(--text-color);">${b.blockName}</strong>
                            </div>
                        </td>
                        <td>${managerAvatar}</td>
                        <td>${aptBadge}</td>
                        <td>${residentBadge}</td>
                        <td style="color:${poolColor}; font-weight:700; font-size:1.1rem;">${poolSign}${b.currentBalance.toLocaleString('tr-TR')} ₺</td>
                        <td>
                            <button onclick="window.viewBlockFinancials(${b.blockId})" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem; border-radius: 8px; display: inline-flex; align-items:center; gap:6px;">
                                <i class='bx bx-search-alt-2'></i> İncele
                            </button>
                        </td>
                    </tr>
                `;
            });
        } catch (e) {
            console.error(e);
            document.getElementById('block-list-tbody').innerHTML = '<tr><td colspan="6">Veri yüklenemedi.</td></tr>';
        }
    }

    // --> Site Sakinleri Yükleme
    let allResidentsData = [];
    let currentFilteredResidents = [];

    async function loadResidentsData() {
        const tbody = document.getElementById('residents-tbody');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 40px;"><i class="bx bx-loader-alt bx-spin" style="font-size: 2rem; color: var(--primary-color);"></i><br><span style="margin-top:10px; display:block; color:var(--text-secondary);">Veriler Getiriliyor...</span></td></tr>';

        try {
            const res = await fetch(`${BASE_URL}/users`);
            if (!res.ok) throw new Error("Residents fetch failed");

            let rawData = await res.json();

            // YENİ UYGULAMA: Blok Yöneticisi Kısıtlaması (Sadece Kendi Bloğu + Site Yönetimi)
            if (AppState.user.role === 3) {
                const myBlockName = AppState.user.blockName;
                rawData = rawData.filter(u =>
                    u.blockName === myBlockName || // Kendi bloğundaki herkes
                    u.role === 1 || // Site Yöneticisi
                    u.role === 2    // Site Yöneticisi Yrd.
                );
            }

            allResidentsData = rawData;

            // Blok Filtresini Doldurma
            const blockFilter = document.getElementById('residents-block-filter');
            if (blockFilter) {
                const uniqueBlocks = [...new Set(allResidentsData.filter(u => u.blockName && u.blockName !== "Atanmadı").map(u => u.blockName))].sort();
                let opts = '<option value="all">Tüm Bloklar</option>';
                // Blok yöneticisi ise "Site Yönetimi" filtresi kalsın ama sadece genel yetkilileri görebilir
                opts += '<option value="site-management">Site Yönetimi (Ekip & Personel)</option>';
                uniqueBlocks.forEach(b => { opts += `<option value="${b}">${b}</option>`; });
                const currentSel = blockFilter.value;
                blockFilter.innerHTML = opts;
                // Eğer eskiden seçili bir değer varsa ve hala mevcutsa onu geri seç
                let optionExists = false;
                for (let i = 0; i < blockFilter.options.length; i++) {
                    if (blockFilter.options[i].value === currentSel) {
                        optionExists = true;
                        break;
                    }
                }
                if (optionExists) blockFilter.value = currentSel;
            }

            window.filterResidentsList();

        } catch (error) {
            console.error('Residents load failed:', error);
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 30px; color: var(--danger);"><i class="bx bx-error-circle" style="font-size: 1.5rem;"></i><br>Hata: Veriler yüklenemedi. Sunucu bağlantısını kontrol edin.</td></tr>';
        }
    }

    window.filterResidentsList = function (forcedRoleFilter) {
        if (!allResidentsData) return;

        const roleSelect = document.getElementById('residents-filter');
        if (forcedRoleFilter && typeof forcedRoleFilter === 'string') {
            roleSelect.value = forcedRoleFilter;
        }

        const roleFilter = roleSelect?.value || 'all';
        const blockFilter = document.getElementById('residents-block-filter')?.value || 'all';
        const searchTerm = document.getElementById('residents-search-input')?.value.toLowerCase() || '';

        // Site Yönetimi için özel filtre mantığı
        if (blockFilter === 'site-management') {
            // Site Yönetimi (1,2) + Personeller (6,7,8)
            currentFilteredResidents = allResidentsData.filter(u => u.role === 1 || u.role === 2 || u.role === 6 || u.role === 7 || u.role === 8);
        } else {
            currentFilteredResidents = allResidentsData.filter(u => {
                // Rol Filtresi
                let roleMatch = true;
                if (roleFilter === 'owner') roleMatch = (u.role === 4);
                else if (roleFilter === 'tenant') roleMatch = (u.role === 5);
                else if (roleFilter === 'block_manager') roleMatch = (u.role === 3);
                else if (roleFilter === 'staff') roleMatch = (u.role === 6 || u.role === 7 || u.role === 8);

                // Blok Filtresi
                let blockMatch = true;
                if (blockFilter !== 'all') {
                    blockMatch = (u.blockName === blockFilter);
                }

                // Arama Kutusu Filtresi (İsim, Rol, Daire No)
                let searchMatch = true;
                if (searchTerm) {
                    const turkishRole = getRoleName(u.role).toLowerCase();
                    const aptNoStr = u.apartmentNumber ? u.apartmentNumber.toString() : "";
                    const searchTarget = (u.fullName + " " + turkishRole + " " + aptNoStr).toLowerCase();
                    searchMatch = searchTarget.includes(searchTerm);
                }

                return roleMatch && blockMatch && searchMatch;
            });
        }

        // Sıralama Algoritması: Yönetici (3) ve Personeller (6,7,8 vs), normal yöneticiler (1,2) üstte, 
        // Ancak özellikle Apartman Yöneticisi (3) ve Görevlisi (7) aynı blok içindeyken en üste çıkmalı.
        // Genel hiyerarşi: 1, 2, 3, 6/7/8, 4, 5
        currentFilteredResidents.sort((a, b) => {
            const roleWeight = (role) => {
                if (role === 1 || role === 2) return 100; // Site Yönetimi en üstte
                if (role === 3) return 90; // Apartman Yöneticisi
                if (role === 6 || role === 7 || role === 8) return 80; // Personeller
                return 10; // Malik/Kiracı
            };
            return roleWeight(b.role) - roleWeight(a.role);
        });


        window.renderResidentsBatch(true);
    };

    window.renderResidentsBatch = function (clearFirst = false) {
        const tbody = document.getElementById('residents-tbody');
        if (!tbody) return;

        if (clearFirst) tbody.innerHTML = '';

        if (currentFilteredResidents.length === 0 && clearFirst) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 30px; color: var(--text-secondary);">Bu kriterlere uygun kişi bulunamadı.</td></tr>';
            return;
        }

        const start = clearFirst ? 0 : tbody.children.length;
        const end = Math.min(start + 10, currentFilteredResidents.length);

        if (start >= currentFilteredResidents.length) return; // Hepsi yüklendi

        let htmlChunk = '';
        for (let i = start; i < end; i++) {
            const user = currentFilteredResidents[i];

            let roleBadgeClass = 'badge';
            if (user.role === 1 || user.role === 2) roleBadgeClass = 'badge-manager';
            else if (user.role === 4) roleBadgeClass = 'badge-owner';
            else if (user.role === 3) roleBadgeClass = 'badge-manager';
            else roleBadgeClass = 'badge-tenant';

            const userIcon = `<div style="width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; justify-content:center; align-items:center; border: 1px solid var(--surface-border);"><i class='bx bx-user' style="color:var(--text-secondary);"></i></div>`;
            const turkishRoleName = getRoleName(user.role);

            htmlChunk += `
                <tr style="transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                    <td>
                        <div style="display:flex; align-items:center; gap:12px; padding: 4px 0;">
                            ${userIcon}
                            <span style="font-weight: 600; font-size: 1.05rem;">${user.fullName}</span>
                        </div>
                    </td>
                    <td><span class="${roleBadgeClass}" style="padding: 4px 10px; font-size: 0.8rem; font-weight:600; border-radius: 20px; letter-spacing: 0.3px;">${turkishRoleName}</span></td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px; color: var(--text-secondary);">
                            <i class='bx bx-buildings'></i>
                            <span style="font-weight:500;">${user.blockName || 'Site Geneli'}</span>
                        </div>
                    </td>
                    <td>
                        <div style="display:flex; align-items:center; gap:8px; color: var(--text-primary);">
                           <span style="font-weight:600;">${user.apartmentNumber || '-'}</span>
                        </div>
                    </td>
                </tr>
            `;
        }

        tbody.insertAdjacentHTML('beforeend', htmlChunk);
    };

    // Sonsuz Kaydırma (Infinite Scroll) Dinleyicisi
    window.addEventListener('scroll', () => {
        if (AppState.currentView !== 'residents') return;
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            window.renderResidentsBatch(false);
        }
    });


    // 7. MODAL FORM SUBMIT (FETCH POST) EVENTLERİ
    // Duyuru Oluşturma ve Düzenleme
    document.getElementById('announcementForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const editId = form.getAttribute('data-edit-id');

        const body = {
            title: document.getElementById('annTitle').value,
            content: document.getElementById('annContent').value,
            targetScope: parseInt(document.getElementById('annScope').value),
            targetBlockId: AppState.user.role === 3 ? AppState.user.blockId : (document.getElementById('annScope').value == "2" ? parseInt(document.getElementById('annTargetBlock').value) : null),
            createdById: AppState.user.id
        };

        if (editId) {
            await fetch(`${BASE_URL}/announcement/${editId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        } else {
            await fetch(`${BASE_URL}/announcement`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        }

        form.removeAttribute('data-edit-id');
        if (document.querySelector('#announcementModal h2')) document.querySelector('#announcementModal h2').textContent = 'Yeni Duyuru Oluştur';
        if (document.querySelector('#announcementModal h3')) document.querySelector('#announcementModal h3').textContent = 'Yeni Duyuru Oluştur';

        closeModal('announcementModal');
        // İlgili sekmeyi veya dashboardu anında yenile
        await loadAnnouncementsData();

        // Yeniledikten sonra mevcut filtreyi tekrar uygula (Anlık görünüm için)
        const dropdownVal = document.getElementById('announcement-filter')?.value || 'all';
        if (window.filterAnnouncements) {
            window.filterAnnouncements(dropdownVal);
        }

        if (AppState.currentView === 'dashboard') loadDashboardData();
    });

    // Finansal İşlem Ekleme veya Düzenleme
    document.getElementById('financialForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const editId = form.getAttribute('data-edit-id');

        const finBlockVal = document.getElementById('finTargetBlock').value;
        const body = {
            description: document.getElementById('finDesc').value,
            amount: parseFloat(document.getElementById('finAmount').value),
            transactionType: parseInt(document.getElementById('finType').value),
            targetPool: AppState.user.role === 3 ? 2 : parseInt(document.getElementById('finPool').value),
            blockId: AppState.user.role === 3 ? AppState.user.blockId : (document.getElementById('finPool').value == "2" ? (finBlockVal ? parseInt(finBlockVal) : null) : null),
            performedById: AppState.user.id
        };

        let res;
        if (editId) {
            res = await fetch(`${BASE_URL}/financial/transaction/${editId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        } else {
            res = await fetch(`${BASE_URL}/financial/transaction`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        }

        if (res.ok) {
            alert(editId ? 'İşlem güncellendi!' : 'İşlem kaydedildi!');
            form.removeAttribute('data-edit-id');
            document.querySelector('#financialModal h3').textContent = 'Manuel Finansal İşlem (Gelir/Gider)';
            closeModal('financialModal');
            loadFinancialsData(); // Finansal Tabloyu anlık yenile
            loadDashboardData();
        } else {
            alert('İşlem sırasında hata oluştu.');
        }
    });

    document.getElementById('electionForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const editId = form.getAttribute('data-edit-id');

        const candSelect = document.getElementById('elecCandidates');
        const selectedCands = Array.from(candSelect.selectedOptions).map(opt => opt.value);
        const optionsStr = document.getElementById('elecOptions').value;
        const optionsList = optionsStr.split(',').map(s => s.trim()).filter(s => s);
        const type = parseInt(document.getElementById('elecType').value);

        const body = {
            title: document.getElementById('elecTitle').value,
            description: document.getElementById('elecDescription')?.value || '',
            type: type,
            startDate: document.getElementById('elecStart').value,
            endDate: document.getElementById('elecEnd').value,
            scope: parseInt(document.getElementById('elecScope').value),
            blockId: AppState.user.role === 3 ? AppState.user.blockId : (document.getElementById('elecScope').value == "2" ? parseInt(document.getElementById('elecTargetBlock').value) : null),
            voterEligibility: parseInt(document.getElementById('elecVoter').value),
            createdByRole: AppState.user.role,
            candidateUserIds: type === 1 ? selectedCands : [],
            candidateNames: type === 2 ? optionsList : []
        };

        let res;
        if (editId) {
            res = await fetch(`${BASE_URL}/election/${editId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        } else {
            res = await fetch(`${BASE_URL}/election`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        }

        if (res.ok) {
            form.removeAttribute('data-edit-id');
            document.querySelector('#electionModal h3').textContent = 'Yeni Seçim/Oylama Başlat';
            closeModal('electionModal');

            // Veriyi anlık yenile ve mevcut sekmeyi/filtreyi koru
            await loadElectionsData();

            const activeTabBtn = document.querySelector('.tab-btn.active');
            const activeTabName = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'active';
            if (window.renderElectionsTab) {
                window.renderElectionsTab(activeTabName);
            }

            const dropdownVal = document.getElementById('election-filter')?.value || 'all';
            if (window.filterElections) {
                window.filterElections(dropdownVal);
            }

            loadDashboardData(); // Dashboard'ı da anlık güncelle

        } else {
            alert('Oylama kaydedilemedi. Hata oluştu.');
        }
    });

    window.toggleElectionTypeUI = function () {
        const type = document.getElementById('elecType').value;
        if (type === "1") {
            document.getElementById('elecCandidatesWrapper').style.display = 'block';
            document.getElementById('elecOptionsWrapper').style.display = 'none';
        } else {
            document.getElementById('elecCandidatesWrapper').style.display = 'none';
            document.getElementById('elecOptionsWrapper').style.display = 'block';
        }
    };

    // Yeni Otomatik (Recurring) İşlem Ekleme / Düzenleme
    document.getElementById('recurringForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const editId = form.getAttribute('data-edit-id');

        const body = {
            description: document.getElementById('recDesc').value,
            amount: parseFloat(document.getElementById('recAmount').value),
            transactionType: parseInt(document.getElementById('recType').value),
            targetPool: AppState.user.role === 3 ? 2 : parseInt(document.getElementById('recPool').value),
            blockId: AppState.user.role === 3 ? AppState.user.blockId : (document.getElementById('recPool').value == "2" ? parseInt(document.getElementById('recTargetBlock').value) : null),
            executionDay: parseInt(document.getElementById('recDateExecution').value),
            endDate: document.getElementById('recEndDate').value,
            createdById: AppState.user.id
        };

        let res;
        if (editId) {
            res = await fetch(`${BASE_URL}/financial/recurring/${editId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        } else {
            res = await fetch(`${BASE_URL}/financial/recurring`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
        }

        if (res.ok) {
            alert(editId ? 'Talimat güncellendi!' : 'Yepyeni bir otomatik işlem (aylık kesinti/ekleme) kaydedildi!');
            form.removeAttribute('data-edit-id');
            document.querySelector('#recurringModal h2').textContent = 'Yeni Otomatik (Düzenli) İşlem Ekle';
            if (AppState.currentView === 'financials') loadFinancialsData();
            closeModal('recurringModal');
        } else {
            alert('İşlem talimatı verilirken bir hata oluştu. Lütfen tarih/tutar formatlarını kontrol ediniz.');
        }
    });

    // --- RECURRING LIST MODAL FUNCTIONS ---
    window.openNewRecurringModal = function () {
        document.getElementById('recurringForm').reset();
        document.getElementById('recurringForm').removeAttribute('data-edit-id');
        document.querySelector('#recurringModal h2').textContent = 'Yeni Otomatik (Düzenli) İşlem Ekle';

        const recPoolEl = document.getElementById('recPool');
        const recBlockWrapper = document.getElementById('recBlockWrapper');

        if (AppState.user.role === 3) {
            if (recPoolEl) {
                recPoolEl.value = '2'; // Block Havuzu
                Array.from(recPoolEl.options).forEach(opt => {
                    if (opt.value === '1') { opt.disabled = true; opt.style.display = 'none'; }
                });
                recPoolEl.style.pointerEvents = 'none';
                recPoolEl.closest('.input-group').style.display = 'none';
            }
            if (recBlockWrapper) recBlockWrapper.style.display = 'none';
        } else {
            if (recPoolEl) {
                recPoolEl.style.pointerEvents = 'auto';
                recPoolEl.closest('.input-group').style.display = 'block';
                Array.from(recPoolEl.options).forEach(opt => {
                    if (opt.value === '1') { opt.disabled = false; opt.style.display = 'block'; }
                });
            }
            if (recBlockWrapper) recBlockWrapper.style.display = 'none';
        }

        window.openModal('recurringModal');
    };

    window.openRecurringListModal = async function () {
        try {
            const blockQuery = AppState.user.role === 1 || AppState.user.role === 2 ? '' : `?blockId=${AppState.user.blockId || ''}`;
            const res = await fetch(`${BASE_URL}/financial/recurring${blockQuery}`);

            if (res.ok) {
                const data = await res.json();
                const tbody = document.getElementById('recurring-list-tbody');
                tbody.innerHTML = '';

                if (data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color: var(--text-secondary);">Mevcut bir otomatik talimat bulunmuyor.</td></tr>';
                } else {
                    data.forEach(item => {
                        const descSafe = item.description.replace(/'/g, "\\'").replace(/"/g, "&quot;");
                        const typeStr = item.type === 1
                            ? '<span class="badge" style="background:var(--success); color:white;">Gelir (+)</span>'
                            : '<span class="badge" style="background:var(--danger); color:white;">Gider (-)</span>';
                        const poolStr = item.pool === 1 ? 'Site Havuzu' : 'Kasası';

                        const actionBtns = `
                            <button onclick="window.editRecurring(${item.id}, '${descSafe}', ${item.amount}, ${item.type}, ${item.pool}, ${item.blockId || 'null'}, ${item.dayOfMonth}, '${item.endDate}')" class="btn-icon" style="color:var(--primary-color); border:none; background:none; cursor:pointer;" title="Düzenle"><i class='bx bx-edit'></i></button>
                            <button onclick="window.deleteRecurring(${item.id})" class="btn-icon" style="color:var(--danger); border:none; background:none; cursor:pointer; margin-left: 10px;" title="Sil/İptal Et"><i class='bx bx-trash'></i></button>
                        `;

                        tbody.innerHTML += `
                            <tr>
                                <td style="font-weight: 500;">${item.description}</td>
                                <td>${item.amount.toLocaleString('tr-TR')} ₺</td>
                                <td>${typeStr}</td>
                                <td>${poolStr}</td>
                                <td>Ayın ${item.dayOfMonth}. Günü</td>
                                <td>${actionBtns}</td>
                            </tr>
                        `;
                    });
                }
                window.openModal('recurringListModal');
            }
        } catch (err) {
            console.error(err);
        }
    };

    window.deleteRecurring = async function (id) {
        if (!confirm("Otomatik işlemi silmek / iptal etmek istediğinize emin misiniz?")) return;
        try {
            const dRes = await fetch(`${BASE_URL}/financial/recurring/${id}`, { method: 'DELETE' });
            if (dRes.ok) {
                window.openRecurringListModal(); // Listeyi yenile
            }
        } catch (e) { console.error(e); }
    };

    window.editRecurring = function (id, desc, amount, type, pool, blockId, day, endDate) {
        document.getElementById('recDesc').value = desc;
        document.getElementById('recAmount').value = amount;
        document.getElementById('recType').value = type;
        document.getElementById('recPool').value = pool;
        if (pool == 2) {
            document.getElementById('recBlockWrapper').style.display = 'block';
            document.getElementById('recTargetBlock').value = blockId;
        } else {
            document.getElementById('recBlockWrapper').style.display = 'none';
        }
        document.getElementById('recDateExecution').value = day;

        if (endDate && endDate !== 'null') {
            document.getElementById('recEndDate').value = endDate;
        } else {
            document.getElementById('recEndDate').value = '';
        }

        document.getElementById('recurringForm').setAttribute('data-edit-id', id);
        const modalTitle = document.querySelector('#recurringModal h2') || document.querySelector('#recurringModal h3');
        if (modalTitle) modalTitle.textContent = 'Otomatik İşlemi Düzenle';

        window.closeModal('recurringListModal');
        window.openModal('recurringModal');
    };

    // Modal UI Dinamikleri (Kapsam değiştiğinde Blok seçicisini göster/gizle)
    const setupScopeToggle = (scopeId, wrapperId, blockSelectId) => {
        const scope = document.getElementById(scopeId);
        if (!scope) return;
        scope.addEventListener('change', async (e) => {
            const wrapper = document.getElementById(wrapperId);
            if (e.target.value === "2") {
                wrapper.style.display = 'block';
                // Blokları çek ve doldur
                const res = await fetch(`${BASE_URL}/blocks`);
                const blocks = await res.json();
                const sel = document.getElementById(blockSelectId);
                sel.innerHTML = '';
                blocks.forEach(b => {
                    sel.innerHTML += `<option value="${b.id}">${b.name}</option>`;
                });
            } else {
                wrapper.style.display = 'none';
            }
        });
    };

    setupScopeToggle('annScope', 'annBlockWrapper', 'annTargetBlock');
    setupScopeToggle('finPool', 'finBlockWrapper', 'finTargetBlock');
    setupScopeToggle('elecScope', 'elecBlockWrapper', 'elecTargetBlock');
    setupScopeToggle('recPool', 'recBlockWrapper', 'recTargetBlock');

    // --- OYLAMA (ELECTION) ADAYLARINI DOLDURMA VE FİLTRELEME ---
    let electionCandidatesData = []; // Tüm adayları hafızada tutmak için global değişken

    // Kapsam Değiştikçe veya Modal Açıldığında Adayları Getir
    const fetchAndRenderCandidates = async () => {
        let scopeVal = document.getElementById('elecScope').value;
        let blockVal = document.getElementById('elecTargetBlock').value;

        // Blok yöneticisi ise zorunlu olarak sadece kendi bloğunu sorgula
        if (AppState.user.role === 3) {
            scopeVal = "2";
            blockVal = AppState.user.blockId;
        }

        // Eğer kapsam 2 (Belirli Blok) ise blockId gönder, değilse boş
        const blockId = scopeVal == "2" ? blockVal : '';

        try {
            const res = await fetch(`${BASE_URL}/election/candidates?scope=${scopeVal}&blockId=${blockId}`);
            if (res.ok) {
                electionCandidatesData = await res.json();
                renderCandidatesList(electionCandidatesData); // Ekrana çiz
            }
        } catch (e) { console.error("Adaylar getirilemedi:", e); }
    };

    // Adayları Select Kutusuna Çizme Ek Fonksiyonu (Lazy Loading: İlk 10)
    let renderedCandidateCount = 0;
    const renderCandidatesList = (candidates, clearFirst = true) => {
        const candsSelect = document.getElementById('elecCandidates');
        if (!candsSelect) return;

        if (clearFirst) {
            candsSelect.innerHTML = '';
            renderedCandidateCount = 0;
        }

        if (candidates.length === 0 && clearFirst) {
            candsSelect.innerHTML = '<option disabled>Bu kriterlere uygun aday bulunamadı.</option>';
            return;
        }

        const start = renderedCandidateCount;
        const end = Math.min(start + 10, candidates.length);

        for (let i = start; i < end; i++) {
            const u = candidates[i];
            const blockInfo = u.blockName ? ` - ${u.blockName}` : '';
            candsSelect.innerHTML += `<option value="${u.id}">${u.fullName} (${u.roleName}${blockInfo})</option>`;
        }

        renderedCandidateCount = end;

        // Eğer daha fazla aday varsa bir "Daha Fazla..." opsiyonu ekleyebiliriz veya scroll mantiği kurabiliriz.
        // Kullanıcı isteğine uygun olarak 10'arlı gösterim sağlandı.
    };

    // Adaylar listesinde aşağı kaydırıldığında daha fazla yükle
    document.getElementById('elecCandidates')?.addEventListener('scroll', (e) => {
        const el = e.target;
        if (el.scrollHeight - el.scrollTop <= el.clientHeight + 1) {
            // Sona gelindi, mevcut filtrelenmiş veriden sonraki 10'u ekle
            const searchTerm = document.getElementById('elecCandidateSearch')?.value.toLowerCase() || '';
            const filtered = searchTerm
                ? electionCandidatesData.filter(u => u.fullName.toLowerCase().includes(searchTerm) || u.roleName.toLowerCase().includes(searchTerm))
                : electionCandidatesData;

            if (renderedCandidateCount < filtered.length) {
                renderCandidatesList(filtered, false);
            }
        }
    });

    // Kapsam (Scope) veya Hedef Blok Değiştiğinde Adayları Yeniden Getir
    document.getElementById('elecScope')?.addEventListener('change', fetchAndRenderCandidates);
    document.getElementById('elecTargetBlock')?.addEventListener('change', fetchAndRenderCandidates);

    // Yeni Oylama Butonuna Basıldığında (Modal Açılırken) Default Adayları Yükle
    document.getElementById('btn-new-election')?.addEventListener('click', () => {
        // Form sıfırlandıktan sonra varsayılan değerleri getir
        const modalSubmitBtn = document.querySelector('#electionForm button[type="submit"]');
        if (modalSubmitBtn) modalSubmitBtn.innerHTML = 'Başlat <i class=\'bx bx-play\'></i>';
        setTimeout(() => { fetchAndRenderCandidates(); }, 100);
    });

    // Aday Arama/Filtreleme Kutusu Logic
    document.getElementById('elecCandidateSearch')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        if (!searchTerm) {
            // Arama kutusu boşsa tüm havuzu göster
            renderCandidatesList(electionCandidatesData);
            return;
        }

        // İsimde ve rolde harf uyuşması ara
        const filtered = electionCandidatesData.filter(u =>
            u.fullName.toLowerCase().includes(searchTerm) ||
            u.roleName.toLowerCase().includes(searchTerm)
        );

        renderCandidatesList(filtered);
    });

    // Escape Key Modal Close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal-overlay.active, .modal-overlay.show');
            activeModals.forEach(modal => {
                window.closeModal(modal.id);
            });
        }
    });

    // Uygulamayı tetikle (Boot)
    initApp();

});
