# [Listujeme](https://listu.jeme.cz)

Listujeme je neoficiální [Svelte](https://svelte.dev/) frontend projektu Listujeme, který nabízí
všechna vydání Floriána (zpravodaje městyse Lázně Toušeň) v elektronické podobě.

Živá verze: https://listu.jeme.cz

Featury:

- Procházení čísel
- Fulltextové vyhledávání
- Filtrování a řazení výsledků

## Development

Požadavky:

- [Git](https://git-scm.com/downloads)
- [pnpm](https://pnpm.io/)
- Běžící [ListujemeAPI](https://github.com/huzvanec/ListujemeAPI) development server

### Příprava projektu

```shell
# Klonování frontend repa
git clone https://github.com/huzvanec/Listujeme.git
cd Listujeme

# Instalace knihoven
pnpm install

# Vytvoření development .env souboru
# VITE_API_HOST: Adresa development API serveru
#   localhost:port nebo lokalni_ip:port (pokud je v plánu testovat na dalších zařízeních v síti)
echo """
VITE_API_HOST=http://localhost:8080
""" > .env.development

# Vytvoření produkčního .env souboru
# VITE_API_HOST: Adresa produkčního API serveru
echo """
VITE_API_HOST=https://listu.jeme.cz/api
""" > .env.production
```

### Spuštění live development serveru

```shell
pnpm dev
```

### Produkční build

```shell
pnpm build
```