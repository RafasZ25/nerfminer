document.addEventListener('DOMContentLoaded', () => {
    // Lista de palavras-alvo (5 letras)
    const words = [
        "ABRIR", "AMIGO", "BANHO", "CAIXA", "DIZER",
        "FALAR", "GOSTO", "HORAS", "JOGAR", "LIVRO", 
        "NOITE", "OCUPA", "PAPEL", "QUASE",
        "RADIO", "SABER", "TARDE", "UNIDO", "VIVER"
    ];

    // Elementos do DOM
    const board = document.getElementById('board');
    const message = document.getElementById('message');
    const usedLettersContainer = document.getElementById('used-letters');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeBtn = document.querySelector('.close');

    // Variáveis do jogo
    let targetWord = '';
    let currentRow = 0;
    let currentCell = 0;
    let gameOver = false;
    let usedLetters = new Set();
    let activeCell = null;

    // Inicializar o jogo
    function initGame() {
        // Selecionar palavra aleatória
        targetWord = words[Math.floor(Math.random() * words.length)];
        console.log("Palavra");

        // Resetar variáveis
        currentRow = 0;
        currentCell = 0;
        gameOver = false;
        usedLetters = new Set();
        message.textContent = '';
        usedLettersContainer.textContent = '';

        // Criar tabuleiro
        board.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('div');
            row.className = 'row';
            row.dataset.row = i;
            for (let j = 0; j < 5; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.cell = j;

                // Adicionar evento de clique
                cell.addEventListener('click', () => {
                    if (!gameOver && parseInt(cell.dataset.row) === currentRow) {
                        // Remover ativo de todas as células
                        document.querySelectorAll('.cell.active').forEach(c => {
                            c.classList.remove('active');
                        });

                        // Se clicar em uma célula preenchida, vai para a próxima vazia
                        if (cell.textContent && j < 4) {
                            const nextCell = row.querySelector(`.cell[data-cell="${j + 1}"]`);
                            nextCell.classList.add('active');
                            activeCell = nextCell;
                            currentCell = j + 1;
                        } else {
                            cell.classList.add('active');
                            activeCell = cell;
                            currentCell = j;
                        }
                    }
                });

                row.appendChild(cell);
            }
            board.appendChild(row);
        }

        // Definir primeira célula como ativa
        activeCell = document.querySelector('.cell');
        activeCell.classList.add('active');
    }

    // Manipular pressionamento de tecla
    function handleKeyPress(key) {
        if (gameOver) return;

        const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
        const currentRowCells = currentRowElement ? Array.from(currentRowElement.querySelectorAll('.cell')) : [];

        if (key === 'Enter') {
            // Verificar se todas as células estão preenchidas
            const allFilled = currentRowCells.every(cell => cell.textContent);
            if (allFilled) {
                checkGuess();
            } else {
                message.textContent = "Preencha todas as letras!";
                setTimeout(() => message.textContent = '', 2000);
            }
        } else if (key === 'Backspace') {
            if (activeCell && activeCell.textContent) {
                // Apagar conteúdo da célula ativa
                activeCell.textContent = '';
                activeCell.classList.remove('filled');
            } else if (currentCell > 0) {
                // Mover para célula anterior
                currentCell--;
                activeCell = currentRowCells[currentCell];
                activeCell.classList.add('active');

                // Apagar conteúdo se houver
                if (activeCell.textContent) {
                    activeCell.textContent = '';
                    activeCell.classList.remove('filled');
                }
            }
        } else if (/^[A-Za-z]$/.test(key)) {
            if (activeCell) {
                activeCell.textContent = key.toUpperCase();
                activeCell.classList.add('filled');

                // Mover para próxima célula se não for a última
                if (currentCell < 4) {
                    activeCell.classList.remove('active');
                    currentCell++;
                    activeCell = currentRowCells[currentCell];
                    activeCell.classList.add('active');
                }
            }
        }
    }

    // Verificar o palpite
    function checkGuess() {
        const currentRowElement = document.querySelector(`.row[data-row="${currentRow}"]`);
        const currentRowCells = currentRowElement.querySelectorAll('.cell');
        let guess = '';

        // Obter a palavra do palpite
        currentRowCells.forEach(cell => {
            guess += cell.textContent;
        });

        // Verificar se tem exatamente 5 letras
        if (guess.length !== 5) {
            message.textContent = "A palavra deve ter 5 letras!";
            shakeRow(currentRow);
            return;
        }

        // Verificar letras
        const targetLetters = targetWord.split('');
        const guessLetters = guess.split('');
        const result = Array(5).fill('');

        // Primeiro passada: marcar letras corretas
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                result[i] = 'right';
                targetLetters[i] = null; // Marcar como já encontrada
            }
        }

        // Segunda passada: marcar letras em posições erradas
        for (let i = 0; i < 5; i++) {
            if (result[i] === 'right') continue;

            const index = targetLetters.indexOf(guessLetters[i]);
            if (index !== -1) {
                result[i] = 'place';
                targetLetters[index] = null; // Marcar como já encontrada
            } else {
                result[i] = 'wrong';
                usedLetters.add(guessLetters[i]);
            }
        }

        // Atualizar células
        for (let i = 0; i < 5; i++) {
            currentRowCells[i].classList.add(result[i]);
        }

        // Atualizar letras usadas
        updateUsedLetters();

        // Verificar vitória
        if (guess === targetWord) {
            message.textContent = "Acertou!";
            gameOver = true;
            setTimeout(() => {
                initGame();
            }, 2000);
            return;
        }

        // Avançar para a próxima linha
        currentRow++;
        currentCell = 0;

        // Definir primeira célula da nova linha como ativa
        if (currentRow < 6) {
            activeCell = document.querySelector(`.row[data-row="${currentRow}"] .cell`);
            activeCell.classList.add('active');
        }

        // Verificar fim de jogo
        if (currentRow === 6) {
            message.textContent = `Tente novamente! A palavra era ${targetWord}`;
            gameOver = true;
            setTimeout(() => {
                initGame();
            }, 2000);
        }
    }

    // Atualizar display de letras usadas
    function updateUsedLetters() {
        if (usedLetters.size > 0) {
            usedLettersContainer.textContent = 'Letras não usadas: ' +
                [...usedLetters].sort().join(', ');
        }
    }

    // Animação de erro (tremer linha)
    function shakeRow(row) {
        const rowElement = document.querySelector(`.row[data-row="${row}"]`);
        rowElement.style.animation = 'shake 0.5s';

        setTimeout(() => {
            rowElement.style.animation = '';
        }, 500);
    }

    // Event listeners
    document.addEventListener('keydown', (e) => {
        e.preventDefault(); // Prevenir comportamento padrão
        handleKeyPress(e.key);
    });

    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
        helpModal.classList.add('align-center-flex');
    });

    closeBtn.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // ----------------------
    // Alternância do Tema
    // ----------------------
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.addEventListener("click", () => {
       document.body.classList.toggle("dark");
       themeToggle.textContent = document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
    });

    // ----------------------
    // Estatísticas
    // ----------------------
    let wins = 0;
    let losses = 0;

    const winPercentageEl = document.getElementById("win-percentage");
    const lossCountEl = document.getElementById("loss-count");

    function updateStats() {
       const totalGames = wins + losses;
       const percentage = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
       winPercentageEl.textContent = `Vitórias: ${percentage}%`;
       lossCountEl.textContent = `Derrotas: ${losses}`;
    }

    // ----------------------
    // Exemplo de onde atualizar
    // ----------------------
    // Chame quando o jogador vencer:
    function playerWins() {
       wins++;
       updateStats();
       alert("Você venceu! 🎉");
    }

    // Chame quando o jogador perder:
    function playerLoses() {
       losses++;
       updateStats();
       alert("Você perdeu! 😢");
    }


    // Iniciar o jogo
    initGame();
});