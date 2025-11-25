//@target "indesign"

// GestorCamadasLinks_v17.jsx
// Descrição: UI para MOSTRAR/OCULTAR camadas.
// ATUALIZADO (v17): Corrigido erro de digitação (typo) na variável 'acaoOcultar'.

function mestreGestorDeCamadas_v17() {

    // 1. Verificações
    if (app.documents.length === 0) {
        alert("Nenhum documento aberto.");
        return;
    }
    var doc = app.activeDocument;
    var camadaAtiva = doc.activeLayer;

    if (!camadaAtiva) {
        alert("Erro: Não foi possível identificar a camada ativa.");
        return;
    }
    if (camadaAtiva.locked === true) {
        alert("A camada selecionada ('" + camadaAtiva.name + "') está bloqueada.", "Script Interrompido");
        return;
    }

    // 2. Criação da Janela
    var myDialog = app.dialogs.add({name: "Gestor de Camadas de Link"});
    var radioCamada = []; 
    var radioOcular, radioMostrar;
    var camadaEspecificaInput;
    
    with(myDialog.dialogColumns.add()) {
        
        // --- Bloco "Escolha a Ação:" ---
        with(borderPanels.add()) {
            staticTexts.add({staticLabel: "Escolha a Ação:"});
            with(radiobuttonGroups.add()) {
                radioOcular = radiobuttonControls.add({staticLabel: "Ocultar Camada", checkedState: true});
                radioMostrar = radiobuttonControls.add({staticLabel: "Mostrar Camada"});
            }
        }
        
        // --- Bloco 1: Seleção (Padrão) ---
        with(borderPanels.add()) {
            staticTexts.add({staticLabel: "Selecione qual camada:"}); 
            
            with(radiobuttonGroups.add()) { 
                with(dialogColumns.add()) {
                    radioCamada[0] = radiobuttonControls.add({staticLabel: "1ª Camada", checkedState: true});
                    radioCamada[1] = radiobuttonControls.add({staticLabel: "2ª Camada"});
                }
            } 
        }
        
        // --- Bloco 2: Precisão ---
        with(borderPanels.add()) {
            staticTexts.add({staticLabel: "Digite a camada:"});
            with (dialogColumns.add()) {
                camadaEspecificaInput = textEditboxes.add({editContents: "", minWidth: 60});
            }
        }
    } 
    
    // 3. Mostra a janela
    if (myDialog.show() !== true) {
        myDialog.destroy();
        return; 
    }
    
    // 4. Lógica de Validação
    var acaoOcultar = radioOcular.checkedState; // A variável correta (com T)
    var alvoTexto = camadaEspecificaInput.editContents;
    var alvoIndice = -1; 

    if (alvoTexto !== "") {
        var alvoNum = parseInt(alvoTexto);
        if (isNaN(alvoNum) || alvoNum <= 0) {
            alert("Número de camada inválido.", "Erro de Input");
            myDialog.destroy();
            return;
        }
        alvoIndice = alvoNum - 1; 
    } else {
        for (var k = 0; k < 2; k++) {
            if(radioCamada[k] && radioCamada[k].checkedState) {
                alvoIndice = k;
                break;
            }
        }
    }
    
    myDialog.destroy(); 
    
    if (alvoIndice === -1) {
        alert("Erro: Nenhuma camada selecionada.");
        return;
    }
    
    // 5. Loop Principal
    var todosGraficos = doc.allGraphics;
    var contadorAI = 0, contadorPSD = 0, contadorINDD = 0;

    if (todosGraficos.length === 0) {
        alert("Não há elementos gráficos (links) neste documento.");
        return;
    }

    for (var i = 0; i < todosGraficos.length; i++) {
        var grafico = todosGraficos[i];
        
        try { 
            if (grafico.parent.itemLayer !== camadaAtiva) {
                continue;
            }
        } catch(e) {
            continue;
        }

        if (grafico.itemLink && grafico.itemLink.isValid) {
            var extensao = grafico.itemLink.name.substring(grafico.itemLink.name.lastIndexOf('.')).toLowerCase();

            if (extensao === ".ai" || extensao === ".psd" || extensao === ".psb" || extensao === ".indd") {
                
                var foiModificado = false;
                
                try { 
                    var layers = grafico.graphicLayerOptions.graphicLayers;
                    
                    if (layers.length > alvoIndice) {
                        var camada = layers[alvoIndice];
                        
                        if (acaoOcultar) { // Ocultar
                            if (camada.currentVisibility === true) {
                                camada.currentVisibility = false;
                                foiModificado = true;
                            }
                        } else { // Mostrar
                            if (camada.currentVisibility === false) {
                                camada.currentVisibility = true;
                                foiModificado = true;
                            }
                        }
                    }
                } catch(e) {
                    // Ignora erro nesta camada
                }

                if (foiModificado) {
                    switch(extensao) {
                        case ".ai": contadorAI++; break;
                        case ".psd":
                        case ".psb": contadorPSD++; break;
                        case ".indd": contadorINDD++; break;
                    }
                }
            }
        }
    } // Fim do loop 'i' (gráficos)

    // 7. Report Final
    var totalModificado = contadorAI + contadorPSD + contadorINDD;
    var acaoTexto = (acaoOcultar) ? "OCULTADA" : "MOSTRADA";
    
    // --- CORREÇÃO (v17) ---
    // Trocado 'acaoOcular' por 'acaoOcultar'
    var alertaNenhum = (acaoOcultar) ? "já estava oculta" : "já estava visível";
    // --- FIM DA CORREÇÃO ---

    if (totalModificado > 0) {
        var mensagemFinal = "Concluído na camada '" + camadaAtiva.name + "'!\n\nA camada selecionada foi " + acaoTexto + " em:\n";
        var detalhes = [];

        if (contadorAI > 0) {
            detalhes.push("• " + contadorAI + " link(s) de Illustrator (.ai)");
        }
        if (contadorPSD > 0) {
            detalhes.push("• " + contadorPSD + " link(s) de Photoshop (.psd/.psb)");
        }
        if (contadorINDD > 0) {
            detalhes.push("• " + contadorINDD + " link(s) de InDesign (.indd)");
        }
        
        alert(mensagemFinal + detalhes.join("\n"));

    } else {
        alert("Nenhum link foi modificado na camada '" + camadaAtiva.name + "'.\n\nVerifique se os itens existem ou se a camada " + alertaNenhum + ".");
    }
}

// Executa o script principal
mestreGestorDeCamadas_v17();