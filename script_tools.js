document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('searchInput');
        const resultsDiv = document.getElementById('results');
        const langSwitcher = document.getElementById('lang-switcher');
        
        let allTools = [];
        let currentLang = 'en'; 

        const translations = {
            en: {
                pageTitle: "Tool Finder",
                headerH1: "Tool Finder",
                headerP: "Search for your tools quickly and efficiently.",
                searchInputPlaceholder: "Search for tools (e.g., calculator, Image Converter)...",
                mainPageButton: "Main Page",
                footerText: "© 2025 Tiwut. All tools at your fingertips.",
                noResultsFound: "No tools found matching \"{searchTerm}\".",
                errorLoading: "Error loading tool list. Please check console.",
                noToolsAvailable: "No tools available. The tool list might be empty or could not be loaded.",
                noToolsToDisplay: "No tools to display."
            },
            de: {
                pageTitle: "Werkzeug-Finder",
                headerH1: "Werkzeug-Finder",
                headerP: "Suchen Sie schnell und effizient nach Ihren Werkzeugen.",
                searchInputPlaceholder: "Suche nach Werkzeugen (z.B. Rechner, Bildkonverter)...",
                mainPageButton: "Hauptseite",
                footerText: "© 2025 Tiwut. Alle Werkzeuge griffbereit.",
                noResultsFound: "Keine Werkzeuge für \"{searchTerm}\" gefunden.",
                errorLoading: "Fehler beim Laden der Werkzeugliste. Bitte Konsole prüfen.",
                noToolsAvailable: "Keine Werkzeuge verfügbar. Die Liste ist möglicherweise leer oder konnte nicht geladen werden.",
                noToolsToDisplay: "Keine Werkzeuge zum Anzeigen."
            },
            es: {
                pageTitle: "Buscador de Herramientas",
                headerH1: "Buscador de Herramientas",
                headerP: "Busca tus herramientas de forma rápida y eficiente.",
                searchInputPlaceholder: "Buscar herramientas (p. ej., calculadora, conversor de imágenes)...",
                mainPageButton: "Página Principal",
                footerText: "© 2025 Tiwut. Todas las herramientas a tu alcance.",
                noResultsFound: "No se encontraron herramientas que coincidan con \"{searchTerm}\".",
                errorLoading: "Error al cargar la lista de herramientas. Por favor, revisa la consola.",
                noToolsAvailable: "No hay herramientas disponibles. La lista podría estar vacía o no se pudo cargar.",
                noToolsToDisplay: "No hay herramientas para mostrar."
            }
        };
        
        const supportedLangs = Object.keys(translations); 

        function applyTranslations(lang) {
            if (!supportedLangs.includes(lang)) {
                lang = 'en'; 
            }
            currentLang = lang;
            document.documentElement.lang = lang; 
            const dict = translations[lang];

            document.title = dict.pageTitle;

            document.querySelectorAll('[data-translate-key]').forEach(element => {
                const key = element.getAttribute('data-translate-key');
                if (dict[key]) {
                    element.textContent = dict[key];
                }
            });

            document.querySelectorAll('[data-translate-placeholder-key]').forEach(element => {
                const key = element.getAttribute('data-translate-placeholder-key');
                if (dict[key]) {
                    element.placeholder = dict[key];
                }
            });
            
            filterAndDisplayTools(); 
        }

        function getInitialLanguage() {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (savedLang && supportedLangs.includes(savedLang)) {
                return savedLang;
            }

            const browserLang = navigator.language.split('-')[0]; 
            if (supportedLangs.includes(browserLang)) {
                return browserLang;
            }

            return 'en'; 
        }
        
        function setupLangSwitcher() {
            const langOptions = {
                en: 'English',
                de: 'Deutsch',
                es: 'Español'
            };

            supportedLangs.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang;
                option.textContent = langOptions[lang];
                langSwitcher.appendChild(option);
            });

            const initialLang = getInitialLanguage();
            langSwitcher.value = initialLang;
            applyTranslations(initialLang);

            langSwitcher.addEventListener('change', (event) => {
                const newLang = event.target.value;
                localStorage.setItem('preferredLanguage', newLang);
                applyTranslations(newLang);
            });
        }

        async function fetchTools() {
            try {
                const response = await fetch('tools.txt');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                allTools = text.split('\n')
                               .map(line => line.trim())
                               .filter(line => line.length > 0);
                
                filterAndDisplayTools();

            } catch (error) {
                console.error('Error fetching or parsing tools.txt:', error);
                resultsDiv.innerHTML = `<p class="no-results">${translations[currentLang].errorLoading}</p>`;
            }
        }

        function displayResults(toolsToDisplay, searchTerm = "") {
            resultsDiv.innerHTML = ''; 
            const dict = translations[currentLang];

            if (toolsToDisplay.length === 0) {
                let message = dict.noToolsToDisplay;
                if (searchTerm) { 
                    message = dict.noResultsFound.replace('{searchTerm}', escapeHTML(searchTerm));
                } else if (allTools.length === 0) {
                    message = dict.noToolsAvailable;
                }
                resultsDiv.innerHTML = `<div class="no-results">${message}</div>`;
            } else {
                toolsToDisplay.forEach((toolFile, index) => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'result-item-wrapper';
                    wrapper.style.animationDelay = `${index * 0.05}s`;

                    const link = document.createElement('a');
                    link.href = toolFile;
                    link.textContent = formatToolName(toolFile);
                    link.className = 'result-item';
                    
                    wrapper.appendChild(link);
                    resultsDiv.appendChild(wrapper);
                });
            }
        }

        function filterAndDisplayTools() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm === "") {
                displayResults(allTools);
                return;
            }
            const filteredTools = allTools.filter(toolFile =>
                toolFile.toLowerCase().includes(searchTerm) ||
                formatToolName(toolFile).toLowerCase().includes(searchTerm)
            );
            displayResults(filteredTools, searchTerm);
        }
        
        function formatToolName(filename) {
            let name = filename.split('.')[0].replace(/[-_]/g, ' ');
            return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        }

        function escapeHTML(str) {
            const div = document.createElement('div');
            div.appendChild(document.createTextNode(str));
            return div.innerHTML;
        }

        searchInput.addEventListener('input', filterAndDisplayTools);

        setupLangSwitcher(); 
        fetchTools();
    });
