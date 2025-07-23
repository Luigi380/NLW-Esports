const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const askAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const askLOL = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
        - Considere a data atual ${new Date().toLocaleDateString()} e faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda com no máximo 500 caracteres.
        - Responda em markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de Resposta
        Pergunta do usuário: Melhor build rengar jungle
        Resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui. \n\n **Runas:** \n\n exemplo de runas\n\n

        ===
        Aqui está a pergunta do usuário: ${question}
    `
    const askValorant = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo **Valorant**.

        ## Tarefa
        Você deve responder às perguntas do usuário com base no seu conhecimento atualizado sobre Valorant: agentes, mapas, composições, economia, mecânicas, estratégias e dicas.

        ## Regras
        - Se você não souber a resposta, diga apenas **"Não sei"** e não invente.
        - Se a pergunta não estiver relacionada a Valorant, diga: **"Essa pergunta não está relacionada ao jogo"**.
        - Considere a data atual ${new Date().toLocaleDateString()} e consulte informações atualizadas sobre o patch atual, se necessário.
        - Nunca inclua agentes, armas ou mecânicas que não estejam no patch atual.
        - Priorize respostas objetivas e baseadas no cenário competitivo atual.

        ## Resposta
        - Seja direto e objetivo. Use **no máximo 500 caracteres**.
        - Formate a resposta em **Markdown**.
        - Não use saudações nem despedidas — vá direto ao ponto.

        ## Exemplo de Resposta
        Pergunta do usuário: Melhor agente para jogar na Ascent soloQ?

        Resposta:
        **Melhor pick soloQ Ascent:**  
        **Agente:** Sova ou Killjoy.  
        **Motivo:** Boa info e controle de área. Fáceis de impactar mesmo sem comunicação.  
        **Dica:** Use o drone do Sova para marcar operadores e a torreta da KJ para cobertura no retake.

        ===
        Aqui está a pergunta do usuário: ${question}
    `
    const askCS = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo **CS:GO**.

        ## Tarefa
        Você deve responder às perguntas do usuário com base no seu conhecimento atualizado sobre CS:GO: táticas, economia, armas, granadas, posições, mapas, configurações e dicas.

        ## Regras
        - Se você não souber a resposta, diga apenas **"Não sei"** e não invente.
        - Se a pergunta não estiver relacionada a CS:GO, diga: **"Essa pergunta não está relacionada ao jogo"**.
        - Considere a data atual ${new Date().toLocaleDateString()} e baseie sua resposta no meta e patch atual.
        - Nunca mencione armas, mapas ou mecânicas que não existam no patch atual.

        ## Resposta
        - Seja direto e objetivo. Use **no máximo 500 caracteres**.
        - Formate a resposta em **Markdown**.
        - Não use saudações nem despedidas — vá direto ao ponto.

        ## Exemplo de Resposta
        Pergunta do usuário: Melhor arma custo-benefício para forçado CT?

        Resposta:
        **Melhor arma no forçado CT:**  
        **Arma:** 5.7 ou MP9.  
        **Motivo:** 5.7 tem alto dano e perfuração; MP9 é barata e ótima em curta distância.  
        **Dica:** Use ângulos curtos para maximizar a vantagem contra rifles.

        ===
        Aqui está a pergunta do usuário: ${question}
    `

    let ask = ''

    if(game == "valorant"){
        ask = askValorant
    } else if(game == "csgo"){
        ask = askCS
    } else if(game == "lol"){
        ask = askLOL
    }

    const contents = [{
        role: "user",
        parts: [{
            text: ask
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    //Chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == "" || game == "" || question == "") {
        alert("Por favor, preencha todos os campos!")
        return
    }

    askButton.disabled = true
    askButton.textContent = "Perguntando..."
    askButton.classList.add("loading")

    try{
        const text = await askAI(question, game, apiKey)
        aiResponse.querySelector(".response-content").innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch(error){
        console.log("Erro: ", error)
    } finally{
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove("loading")
    }
}
form.addEventListener('submit', sendForm)