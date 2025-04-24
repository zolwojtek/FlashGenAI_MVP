# Dokument wymagań produktu (PRD) - FlashGenAI

## 1. Przegląd produktu

FlashGenAI to aplikacja webowa umożliwiająca użytkownikom szybkie i efektywne tworzenie fiszek edukacyjnych przy wsparciu sztucznej inteligencji. Aplikacja adresuje problem czasochłonności manualnego tworzenia fiszek, co często zniechęca użytkowników do korzystania z efektywnej metody nauki, jaką jest metoda powtórek rozłożonych w czasie (spaced repetition).

Kluczowe cechy produktu:
- Automatyczne generowanie fiszek w formacie przód-tył przy użyciu modeli GPT (OpenAI)
- Możliwość manualnego tworzenia i edycji fiszek
- Prosty algorytm powtórek bazujący na zewnętrznym algorytmie open-source
- System kont użytkowników umożliwiający przechowywanie i zarządzanie zestawami fiszek
- Interfejs umożliwiający przeglądanie, akceptację, odrzucanie i edycję wygenerowanych fiszek

Produkt jest zaprojektowany dla osób uczących się, studentów, nauczycieli oraz wszystkich, którzy chcą efektywnie wykorzystać metodę fiszek w procesie nauki, jednocześnie minimalizując czas potrzebny na ich przygotowanie.

## 2. Problem użytkownika

### Główny problem

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition (powtórki rozłożone w czasie).

## 3. Wymagania funkcjonalne

### 3.1 System użytkowników

- Rejestracja i logowanie użytkowników
- Podstawowe zabezpieczenia uwierzytelniania
- Brak zaawansowanych funkcji profilowych - profil użytkownika zawiera tylko podstawowe informacje i zestawy fiszek

### 3.2 Generowanie fiszek

- Wprowadzanie tekstu źródłowego (1000-10000 znaków) do analizy przez AI
- Wykorzystanie API OpenAI (modele GPT) do generowania fiszek
- Limit 5 generacji zestawów fiszek dziennie na użytkownika
- Generowanie fiszek w prostym formacie przód-tył
- Funkcja sugerowania tytułu zestawu przez AI z możliwością modyfikacji przez użytkownika
- Backend jako pośrednik w komunikacji z API OpenAI
- Wydzielony prompt do API dla ułatwienia wersjonowania

### 3.3 Zarządzanie fiszkami

- Interfejs do akceptacji/odrzucenia wygenerowanych fiszek
- Możliwość ręcznej edycji fiszek
- Usuwanie pojedynczych fiszek oraz całych zestawów
- Przechowywanie flag określających sposób powstania fiszki (AI vs. ręcznie)
- Nadawanie i edycja tytułów zestawom

### 3.4 System powtórek

- Prosty algorytm powtórek bazujący na zewnętrznym algorytmie open-source
- Scheduler sprawdzający przy logowaniu, które zestawy wymagają powtórki
- Interfejs umożliwiający przeglądanie fiszek wymagających powtórki

### 3.5 Interfejs użytkownika

- Dashboard użytkownika z trzema głównymi opcjami: powtórki, twoje talie, nowa talia
- Interfejs generowania z polem tekstowym i licznikiem znaków
- Komunikat o pozostałych dziennych limitach generacji
- Przeglądanie fiszek: pojedyncza fiszka na środku ekranu z przyciskami akceptacji i odrzucenia
- Aplikacja webowa bez optymalizacji dla urządzeń mobilnych

## 4. Granice produktu

### 4.1 Co NIE wchodzi w zakres MVP

- Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki)
- Import wielu formatów (PDF, DOCX, itp.)
- Współdzielenie zestawów fiszek między użytkownikami
- Integracje z innymi platformami edukacyjnymi
- Aplikacje mobilne (na początek tylko web)
- Zaawansowany proces onboardingu użytkownika
- Mechanizmy płatności
- Kategoryzacja/tagowanie zestawów fiszek
- Funkcje łączenia zestawów fiszek
- Testowanie fiszek przed wdrożeniem

### 4.2 Ograniczenia

- Limit 5 zestawów fiszek generowanych dziennie per użytkownik
- Limit długości tekstu do generowania fiszek: minimum 1000 znaków, maksimum 10000 znaków
- Aplikacja obsługuje wyłącznie format przód-tył
- Brak generowania fiszek z obrazami lub multimediami
- Użytkownik nie ma wpływu na ilość generowanych fiszek w zestawie
- Brak podpowiedzi dotyczących formatu wprowadzanego tekstu

### 4.3 Zależności

- API OpenAI (konieczny dostęp do modeli GPT)

## 5. Historyjki użytkowników

### Rejestracja i logowanie

#### US-001: Rejestracja nowego użytkownika
- Jako nowy użytkownik, chcę utworzyć konto, aby móc korzystać z funkcji aplikacji.
- Kryteria akceptacji:
  1. Użytkownik może wypełnić formularz rejestracyjny z polami: adres email, hasło, potwierdzenie hasła
  2. System waliduje poprawność wprowadzonych danych
  3. System informuje o błędach walidacji
  4. Po poprawnej rejestracji użytkownik otrzymuje komunikat potwierdzający
  5. Użytkownik zostaje automatycznie zalogowany po udanej rejestracji

#### US-002: Logowanie użytkownika
- Jako zarejestrowany użytkownik, chcę zalogować się do systemu, aby uzyskać dostęp do moich zestawów fiszek.
- Kryteria akceptacji:
  1. Użytkownik może wprowadzić login (email) i hasło
  2. System weryfikuje poprawność danych logowania
  3. W przypadku błędnych danych system wyświetla odpowiedni komunikat
  4. Po poprawnym logowaniu użytkownik zostaje przekierowany do głównego dashboardu
  5. System sprawdza, które zestawy fiszek kwalifikują się do powtórki)

#### US-003: Wylogowanie użytkownika
- Jako zalogowany użytkownik, chcę się wylogować, aby zabezpieczyć moje konto przed nieautoryzowanym dostępem.
- Kryteria akceptacji:
  1. Użytkownik widzi przycisk wylogowania w interfejsie
  2. Po kliknięciu przycisku wylogowania sesja użytkownika zostaje zakończona
  3. Użytkownik zostaje przekierowany na stronę logowania
  4. Nie ma możliwości dostępu do zabezpieczonych funkcji aplikacji bez ponownego zalogowania

### Generowanie fiszek

#### US-004: Generowanie zestawu fiszek z tekstu
- Jako zalogowany użytkownik, chcę wkleić tekst źródłowy i wygenerować z niego fiszki, aby zaoszczędzić czas potrzebny na ręczne tworzenie.
- Kryteria akceptacji:
  1. Użytkownik może wprowadzić tekst źródłowy w pole tekstowe
  2. System wyświetla licznik znaków i informacje o limitach (min. 1000, max. 10000 znaków)
  3. System waliduje długość wprowadzonego tekstu
  4. Użytkownik może kliknąć przycisk "Generuj fiszki"
  5. System wyświetla informację o trwającym procesie generowania
  6. Po zakończeniu generowania użytkownik jest przekierowany do widoku przeglądania wygenerowanych fiszek
  7. System odejmuje jedną generację z dziennego limitu użytkownika

#### US-005: Informacja o limicie dziennych generacji
- Jako zalogowany użytkownik, chcę widzieć informację o pozostałym dziennym limicie generacji fiszek, aby zarządzać wykorzystaniem systemu.
- Kryteria akceptacji:
  1. Użytkownik widzi informację o pozostałej liczbie możliwych generacji w danym dniu
  2. Informacja ta jest widoczna przed rozpoczęciem procesu generowania
  3. Po wykorzystaniu limitu, przycisk generowania jest nieaktywny, a użytkownik otrzymuje stosowny komunikat

#### US-006: Sugerowanie tytułu zestawu przez AI
- Jako użytkownik generujący fiszki, chcę otrzymać sugestię tytułu zestawu od AI, aby nie musieć wymyślać go samodzielnie.
- Kryteria akceptacji:
  1. System automatycznie generuje sugerowany tytuł dla zestawu na podstawie treści tekstu źródłowego
  2. Sugerowany tytuł jest wyświetlany w polu edycji, które użytkownik może modyfikować
  3. Użytkownik może zaakceptować sugerowany tytuł lub wprowadzić własny
  4. Tytuł zestawu jest zapisywany razem z wygenerowanymi fiszkami

### Przeglądanie i zarządzanie fiszkami

#### US-007: Przeglądanie i akceptacja/odrzucanie wygenerowanych fiszek
- Jako użytkownik, chcę przeglądać wygenerowane fiszki i decydować, które chcę zachować, a które odrzucić, aby mieć kontrolę nad jakością mojego zestawu.
- Kryteria akceptacji:
  1. System wyświetla pojedyncze fiszki, jedna po drugiej
  2. Każda fiszka zawiera przód i tył
  3. Dla każdej fiszki użytkownik ma przyciski akceptacji (zielony tick) i odrzucenia (czerwony X)
  4. Po podjęciu decyzji system automatycznie pokazuje następną fiszkę
  5. Odrzucone fiszki są całkowicie usuwane
  6. Po przejrzeniu wszystkich fiszek użytkownik otrzymuje podsumowanie

#### US-008: Ręczna edycja fiszek
- Jako użytkownik, chcę móc edytować zarówno pytania jak i odpowiedzi na fiszkach, aby dostosować je do moich potrzeb.
- Kryteria akceptacji:
  1. Użytkownik może kliknąć przycisk edycji przy wyświetlanej fiszce
  2. System wyświetla formularz z edytowalnymi polami przód i tył
  3. Użytkownik może modyfikować treść przodu i tyłu
  4. Po zapisaniu zmian system aktualizuje fiszkę
  5. Edytowane fiszki są oznaczane jako "ręcznie edytowane"

#### US-009: Manualne tworzenie fiszek
- Jako użytkownik, chcę móc manualnie tworzyć fiszki, aby uzupełnić zestaw o pytania, których AI nie wygenerowało.
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do funkcji dodawania nowej fiszki
  2. System wyświetla formularz z polami na przód i tył
  3. Użytkownik może wprowadzić treść przodu i tyłu
  4. Po zapisaniu fiszka jest dodawana do zestawu
  5. Ręcznie utworzone fiszki są oznaczane odpowiednią flagą

#### US-010: Przeglądanie zestawów fiszek
- Jako użytkownik, chcę przeglądać listę moich zestawów fiszek, aby mieć do nich łatwy dostęp.
- Kryteria akceptacji:
  1. Użytkownik widzi listę wszystkich swoich zestawów fiszek
  2. Dla każdego zestawu wyświetlany jest tytuł i liczba fiszek
  3. Lista może być sortowana według daty utworzenia
  4. Użytkownik może kliknąć w zestaw, aby wyświetlić szczegóły i zawarte w nim fiszki

#### US-011: Usuwanie zestawów fiszek
- Jako użytkownik, chcę móc usuwać niepotrzebne zestawy fiszek, aby utrzymać porządek w moich materiałach.
- Kryteria akceptacji:
  1. Przy każdym zestawie na liście dostępna jest opcja usunięcia
  2. System prosi o potwierdzenie przed usunięciem zestawu
  3. Po potwierdzeniu zestaw jest trwale usuwany wraz ze wszystkimi fiszkami
  4. System wyświetla komunikat potwierdzający usunięcie

### System powtórek

#### US-012: Identyfikacja zestawów do powtórki
- Jako użytkownik, chcę widzieć, które zestawy fiszek wymagają powtórzenia, aby efektywnie planować naukę.
- Kryteria akceptacji:
  1. System automatycznie sprawdza przy logowaniu użytkownika, które zestawy kwalifikują się do powtórki
  2. Zestawy wymagające powtórki są oznaczone na dashboardzie
  3. Użytkownik widzi liczbę zestawów wymagających powtórki
  4. Zestawy do powtórki są dostępne w dedykowanej sekcji "Powtórki"

#### US-013: Przeglądanie fiszek podczas powtórki
- Jako użytkownik, chcę przeglądać fiszki w trybie powtórki, aby utrwalać wiedzę.
- Kryteria akceptacji:
  1. Użytkownik może wybrać zestaw do powtórki
  2. System wyświetla fiszki w trybie przód -> tył
  3. Użytkownik widzi najpierw przód i może zastanowić się nad informacją z tyłu
  4. Po kliknięciu przycisku "Pokaż tył" system wyświetla prawidłową odpowiedź
  5. Użytkownik może przejść do następnej fiszki
  6. Po zakończeniu powtórki system aktualizuje datę ostatniego użycia zestawu

#### US-014: Zakończenie powtórki
- Jako użytkownik, chcę otrzymać podsumowanie po zakończeniu powtórki, aby śledzić moje postępy.
- Kryteria akceptacji:
  1. Po przejrzeniu wszystkich fiszek w zestawie system wyświetla podsumowanie
  2. Podsumowanie zawiera informację o liczbie przejrzanych fiszek
  3. System aktualizuje datę ostatniego użycia zestawu
  4. Użytkownik może wrócić do dashboardu lub wybrać inny zestaw do powtórki

### Dashboard użytkownika

#### US-015: Korzystanie z dashboardu użytkownika
- Jako zalogowany użytkownik, chcę korzystać z przejrzystego dashboardu, aby mieć dostęp do wszystkich funkcji aplikacji.
- Kryteria akceptacji:
  1. Po zalogowaniu użytkownik jest przekierowywany na dashboard
  2. Dashboard zawiera trzy główne opcje: "Powtórki", "Twoje talie", "Nowa talia"
  3. W sekcji "Powtórki" wyświetlana jest liczba zestawów wymagających powtórzenia
  4. W sekcji "Twoje talie" dostępna jest lista wszystkich zestawów użytkownika
  5. Opcja "Nowa talia" prowadzi do interfejsu generowania nowego zestawu fiszek

## 6. Metryki sukcesu

### 6.1 Główne metryki sukcesu

1. 75% fiszek wygenerowanych przez AI jest akceptowane przez użytkownika
   - Sposób pomiaru: stosunek zaakceptowanych fiszek do wszystkich wygenerowanych fiszek przez AI

2. Użytkownicy tworzą 75% fiszek z wykorzystaniem AI
   - Sposób pomiaru: stosunek fiszek wygenerowanych przez AI do wszystkich fiszek w systemie