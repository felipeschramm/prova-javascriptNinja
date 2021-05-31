(function (win, doc) {
    'use strict';

    function app() {

        var betRequest = new XMLHttpRequest()
        var currentGame;
        var data = []
        var choseNumbers = []
        var total = Number(0)
        var allGames = []

        doc.querySelector('[data-js="total"]').textContent = ' TOTAL: R$' + total.toFixed(2)


        function getDataGamesJSON() {
            betRequest.open('GET', '../src/services/games.json')
            betRequest.send()

            betRequest.onreadystatechange = function () {
                if (betRequest.readyState === 4) {
                    data = JSON.parse(betRequest.responseText).types
                }
            }
        }

        function removeChild(element) {
            if (element.firstChild) {
                element.removeChild(element.firstChild)
                removeChild(element)
            }
        }

        function createBettingNumbers(range) {
            var bettingCardNumbers = doc.querySelector('[data-js="bettingCardNumbers"]')
            if (bettingCardNumbers.firstChild) {
                removeChild(bettingCardNumbers)
            }
            for (var i = 1; i <= range; i++) {
                var numberButton = doc.createElement('button')
                var numberText = doc.createTextNode(i < 10 ? '0' + i : i)
                numberButton.setAttribute('class', 'numberBet');
                numberButton.setAttribute('data-number', i < 10 ? '0' + i : i);
                numberButton.appendChild(numberText)
                bettingCardNumbers.appendChild(numberButton)
            }
        }

        function updateStyleButtonsType(type) {
            var wasSelected = doc.querySelector('[data-selected="true"]');
            if (wasSelected) {
                wasSelected.style.background = '#FFF';
                wasSelected.style.color = currentGame.color;
                wasSelected.setAttribute('data-selected', 'false');
            }

            data.map(function (game) {
                if (game.type === type) {
                    var isSelected = doc.querySelector('[value="' + type + '"]');
                    isSelected.style.background = game.color;
                    isSelected.style.color = '#FFF';
                    isSelected.setAttribute('data-selected', 'true');
                }
            })
        }

        function setTypeOfGame(type) {
            choseNumbers = [];

            updateStyleButtonsType(type);

            var forType = doc.querySelector('span[class="title24"]')
            forType.textContent = ' FOR ' + type.toUpperCase()
            var description = doc.querySelector('[class="descriptionBet"]')

            data.forEach(function (item) {
                if (item.type === type) {
                    currentGame = item;
                    description.textContent = item.description
                    createBettingNumbers(item.range)
                }
            })

        }

        function removeNumber(choseNumbers, currentNumber) {
            var result = choseNumbers.filter(function (number) {
                return number != currentNumber
            })
            return result;
        }

        function elementIsAlreadyChose(array, elem) {
            return array.some(function (currentValue) {
                return currentValue === elem;
            })
        }

        function updateBackgroundColor() {
            choseNumbers.map(function (number) {
                var element = doc.querySelector('[data-number="' + number + '"]')
                element.classList.add('number-selected')
            })
        }

        function getGame() {
            return data.filter(function (game) {
                return game.type === currentGame.type
            })[0]
        }

        function selectNumber(currentNumber) {
            var game = getGame()

            if (elementIsAlreadyChose(choseNumbers, currentNumber)) {
                choseNumbers = removeNumber(choseNumbers, currentNumber)
                doc.querySelector('[data-number="' + currentNumber + '"]').classList.remove('number-selected')
                return choseNumbers;
            }

            if (choseNumbers.length < game['max-number']) {
                choseNumbers.push(currentNumber)
                updateBackgroundColor()
            }

            if (choseNumbers.length > game['max-number']) {
                choseNumbers = removeNumber(choseNumbers, currentNumber)
                doc.querySelector('[data-number="' + currentNumber + '"]').classList.remove('number-selected')
            }
        }

        function clearGame() {
            if (choseNumbers.length === 0)
                return alert('Nenhum número selecionado')

            var allNumbers = doc.querySelectorAll('.number-selected')
            allNumbers.forEach(function (number) {
                number.classList.remove('number-selected')
            })

            choseNumbers = []
        }

        function createBettingCard(left, range) {
            for (var i = 1; i <= left; i++) {
                var number = Math.ceil(Math.random() * range)
                number < 10 ? number = '0' + number : number

                if (elementIsAlreadyChose(choseNumbers, number)) {
                    i--
                } else {
                    choseNumbers.push(number)
                }
            }
        }

        function completeGame() {
            var game = getGame()

            if (choseNumbers.length >= game['max-number']) {
                return alert('Jogo já está completo')
            }

            createBettingCard(game['max-number'] - choseNumbers.length, game.range)
            updateBackgroundColor()

        }

        function generateHtmlGameInCart(formattedChoseNumbers) {

            var divInfoBet = doc.createElement('div')
            divInfoBet.classList.add('infoBet')
            divInfoBet.setAttribute('data-id', Date.now().toString())

            divInfoBet.innerHTML = `
            <img data-js="delete" src="../src/assets/images/trash.svg" class="imgTrash" />
            <div style="width: 4px;height: 86px;background-color: ${currentGame.color};border-radius: 100px 0px 0px 100px;margin-right: 5px;" ></div>
            <div style="width: 234px;">
                <label class="numbersBet">${formattedChoseNumbers}</label>
                <label style="font: italic normal bold 16px Helvetica Neue;color:${currentGame.color};">${currentGame.type}</label>
                <label class="priceBet"> R$ ${currentGame.price.toFixed(2).replace('.', ',')}</label>
            </div>`

            doc.querySelector('[data-js="betInfo"]').appendChild(divInfoBet)

        }

        function formatChoseNumbers() {
            var response = ''
            choseNumbers.sort().forEach(function (item, index) {
                if (index !== choseNumbers.length - 1)
                    response += item + ', '
                else {
                    response += item
                }
            })
            return response;
        }

        function addGameToCart() {
            var formattedChoseNumbers = ''
            if (choseNumbers.length < currentGame['max-number']) {
                return alert('Selecione mais ' + (currentGame['max-number'] - choseNumbers.length) + ' números')
            }

            total += currentGame.price
            updateTotal()

            formattedChoseNumbers = formatChoseNumbers();
            allGames.push({ id: Date.now().toString(), numbers: formattedChoseNumbers, type: currentGame.type, price: currentGame.price })
            generateHtmlGameInCart(formattedChoseNumbers);
            clearGame()
        }

        function updateTotal() {
            doc.querySelector('[data-js="total"]').textContent = ' TOTAL R$' + total.toFixed(2).replace('.', ',')
        }

        function deleteBet(divInfoBet) {
            allGames = allGames.filter(function (bet) {
                if (bet.id === divInfoBet.getAttribute('data-id')) {
                    total = total - Number(bet.price)
                    updateTotal()
                }
                return bet.id != divInfoBet.getAttribute('data-id')
            })


            divInfoBet.remove();
        }

        function saveCart() {
            if (total < currentGame['min-cart-value'])
                alert('Valor mínio de R$ ' + currentGame['min-cart-value'])
            else {
                alert('Carrinho Salvo')
            }
        }

        doc.addEventListener('click', function (e) {
            var dataset = e.target.dataset;

            if (dataset.js === 'typeButton') {
                setTypeOfGame(e.target.value)
            }
            if (dataset.number) {
                selectNumber(dataset.number)
            }
            if (dataset.js === 'clear') {
                clearGame()
            }
            if (dataset.js === 'complete') {
                completeGame()
            }
            if (dataset.js === 'addCart') {
                addGameToCart();
            }
            if (dataset.js === 'delete') {
                deleteBet(e.target.parentElement)
            }
            if (dataset.js === 'save') {
                saveCart();
            }

        })

        getDataGamesJSON()

    }

    app()

})(window, document)