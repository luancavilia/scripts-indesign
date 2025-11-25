//@target "indesign"

// ResetZoom100.jsx
// Descrição: Redefine a escala (zoom) de todos os links do documento para 100%.

function resetarZoomTodosLinks() {

    // 1. Verifica se há um documento aberto
    if (app.documents.length === 0) {
        alert("Nenhum documento aberto.");
        return;
    }

    var doc = app.activeDocument;
    // Pega TODOS os gráficos (JPG, PSD, AI, PDF, etc.)
    var todosGraficos = doc.allGraphics;
    var contador = 0;

    if (todosGraficos.length === 0) {
        alert("Não há links (gráficos) neste documento.");
        return;
    }

    // 2. Loop por todos os gráficos
    for (var i = 0; i < todosGraficos.length; i++) {
        var grafico = todosGraficos[i];

        // 3. Tenta aplicar a escala
        try {
            // Define a escala horizontal e vertical para 100%
            grafico.horizontalScale = 100;
            grafico.verticalScale = 100;
            
            // Conta apenas se teve sucesso
            contador++;

        } catch (e) {
            // Se der erro (ex: item bloqueado, em camada bloqueada, etc.),
            // o script ignora e continua para o próximo.
        }
    }

    // 4. Reporte final
    if (contador > 0) {
        alert("Concluído!\n" + contador + " links foram redefinidos para 100%.");
    } else {
        alert("Nenhum link foi modificado.\nVerifique se os itens ou suas camadas estão bloqueados.");
    }
}

// Executa a função principal
resetarZoomTodosLinks();