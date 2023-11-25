async function setParamFunc(newType) {
  let viz = document.getElementById("tableauViz");
  try {
    const parameters = await viz.workbook.getParametersAsync();
    const DataType = parameters.find((p) => p.name == "dataType");
    newVal = await DataType.changeValueAsync(newType);
    console.log(newVal);
  } catch (error) {
    console.log(error);
  }
}

Shiny.addCustomMessageHandler("updateParam", function (message) {
  setParamFunc(message);
});
