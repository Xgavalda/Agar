// Fa servir express
var express=require("express");
app=express();

// Crear un servidor
servidor = require("http").createServer(app);
io = require("socket.io").listen(servidor);


// Escolta el port 4000
servidor.listen(4000);
// Permet pagina estatica
app.use(express.static(__dirname+"/public"));


//Envia pagina estatica...
app.get("/",function(req,res)
{
  res.sendfile(__dirname+"/public/index.html")
});


//Funcions que conecta [CLIENT per exemple "crear"]->[Rep "crear" SERVIDOR i enviar a "creado"]->[CLIENT per exemple "creado"]
io.sockets.on("connection",function(socket)
{
  //CREAR s'ha crida quan un usario s'ha crear i se li passar els seus valor ID, COLOR, BORDER
  socket.on("crear", function(data)
  {
    //S'ha retorna a cada usuario cridan la opcio...
    io.sockets.emit("creado", data);
  });
  //CREAR s'ha mogut un usuari ...
  socket.on("mover",function(data)
  {
    //Envia a tots el USUARIS Aquest moviment...
    io.sockets.emit("moviendo",data);
  });
  //S'elimina una bola...
  socket.on("eliminar",function(data)
  {
    io.sockets.emit("eliminado",data);
  });
  // Crida aquest event quan s'ha crea el mapa per colocar les boles "REP->les boles del USUARIO que donar a (CREAR) i les passe al event "POSICIONADO"
  socket.on("posicionar",function(data)
  {
    io.sockets.emit("posicionado",data)
  });
  // S'envia la eliminacio d'un jugador
  socket.on("jugadoreliminado",function(data)
  {
    io.sockets.emit("eliminarJugador",data)
  });


});