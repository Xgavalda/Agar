// El document esta carregat
$(document).on("ready",function()
{

  //Passarale de SOCKET.IO 
  var socket=io.connect();
  //Lectura del NOM D'USUSARI
  var txtMen = $('#txtMensaje');
  //Lectura del color del USUARI
  var color = $('#color');
  var eliminado;

  //Relotge per ORDENAR EL TAULE segons punts.
  setInterval(ordenar,1000);

  //Funcio d'ordenacio segons els punts.
  function ordenar()
  {
    var $listaj = $('#listaj');

    $listaj.find('.test').sort(function(a ,b)
    {
      return +a.dataset.percentage - + b.dataset.percentage;
    }).appendTo($listaj);

    [].reverse.call($('#listaj li')).appendTo('#listaj');
  };

  // FX que quan s'apreta EL "boto" fa un fade cap adalt de tot el DIV. ;-)
  $("#boton").on("click",function()
  {
    $("#recuadro").slideUp();
  });

  // ACCIO CREA MAPA
  $("#mapa").on("click",function()
  {
    // Creacio de 100 boles amb 4 colors iguals
    for (var i=1;i<100;i++)
    {
      var c= Math.floor(Math.random() *5) + 1;
      var col;

      if (c==1)
      {
        col="#f220e6";      
      }
      if (c==2)
      {
        col="#a4f21e";      
      }
      if (c==3)
      {
        col="#2096f3";      
      }
      if (c==4)
      {
        col="#fbe100";      
      }
      // Posicio de les boles 2000*900
      var posBol=
      {
        left:Math.floor(Math.random() * 2000) +1,
        top:Math.floor(Math.random() * 900) +1,
        color:col
      }
      // Div on template on s'ha coloquen les boles
      // Boles amb el seu id= bolita(?)
      var boles="<div id='bolita"+i+"' class='bolita' type='bolita' name='bolita ' style='background-color:"+posBol.color+";left:"+posBol.left+"px;top:"+posBol.top+"px'>"+i+"</div>";

      //Aqueste dades s'ha passen al servidor amb el procediment "POSICINAR"
      socket.emit("posicionar",boles)
    }
  });


  //Rep les boles del usuari que crea amb el BOTO i les AFAGEIX ;-)
  socket.on("posicionado",function(data)
  {
    //Coloca les pilotes al mapa...
    $("#plataforma").append(data);

    // Comprovacio de mejar boles
    $("#plataforma div").on("mousemove",mejarBoles);

  });

  function mejarBoles()
  {
    eliminado=$(this);
    var $div1=$("#"+$(txtMen).val());

    var x1 = $div1.offset().left;
    var y1 = $div1.offset().top;
    var h1 = $div1.outerHeight(true);
    var w1 = $div1.outerWidth(true);
    var b1 = y1 + h1;
    var r1 = x1 + w1;

    var x2 = $(this).offset().left;
    var y2 = $(this).offset().top;
    var h2 = $(this).outerHeight(true);
    var w2 = $(this).outerWidth(true);
    var b2 = y2 + h2;
    var r2 = x2 + w2;

    //Funcio de colisio
    if ( b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) {return false};

    //Incrementa JUGADOR per que a mentjat una bola
    $("#"+$(txtMen).val()).css("height","+=1");
    $("#"+$(txtMen).val()).css("width","+=1");

    //Borra bola del MAPA
    $(eliminado).remove();

    // Aquest objecta es per MODIFICAR EL CONTADOR.
    var obj = 
    {
      eli: $(eliminado).text(),
      // ID de la llista
      sum: "#"+$(txtMen).val()+"-",
      nombre: $(txtMen).val()
    }

    // Enviar ACCCIO
    socket.emit("eliminar", obj);

  }

  // Rep ACCIO
  socket.on("eliminado",function(data)
  {
    //Valor del contador
    var c = parseInt( $(data.sum).text());
    //Suma +1
    c +=1;
    //Coloca el valor
    $(data.sum).text(c);
    $(data.sum).attr("data-percentage",c);
    //Colaca el nom
    $(data.sum).append("<span> - "+data.nombre+"</span>")
    $("#bolita"+data.eli).remove();
  });


  // Creacio d'un NOU JUGADOR
  $("#boton").on("click",function()
  {
    // Segons el valor del JUGADOR obtens els seus colors...
    var jugadorcolor=$('#color').val();
    var jugadorBorde;

    if (jugadorcolor=="#f44336")
    {
      jugadorBorde="#D21305";
    }
    if (jugadorcolor=="#a4f21e")
    {
      jugadorBorde="#7FC407";
    }
    if (jugadorcolor=="#2196f3")
    {
      jugadorBorde="#0173a8";
    }

    //Obte totes les dades del JUGADOR id, color , border
    var objJugador=
    {
      id: $(txtMen).val(),
      color:jugadorcolor,
      border: jugadorBorde
    }

    //Crea un objecta HTML amb el jugador
    var obj =
    {
      //Aquest es el jugador ...
      jugadorPrincipal : "<div id='"+objJugador.id+"' class='player' type='player' name='"+objJugador.id+"' style='background-color:"+objJugador.color+";border: 5px solid "+objJugador.border+"'>"+objJugador.id+"</div> ",
      //Aquesta es la llista TAULER del jugador
      lista : "<li id='"+objJugador.id+"-' class='test' data-percentage='0'>0<li>"
    }

    //Li passar al SERVIDOR amb la funcio CREAR
    socket.emit("crear",obj);

  })

  //S'ha crida aquest OPCIO per crear USUARIOS
  socket.on("creado", function(data)
  {
    // S'afegeix a JUGADOR
    $("body").append(data.jugadorPrincipal);
    // S'afegeix JUGADOR al TAULLE INFO...
    $("#listaj").append(data.lista);
  });


  //MOVIMENT dels usuaris
  $("body").on("mousemove",function(event)
  {
    //Enviar les dades del USUARI ID (val), x , y ,height, width
    var miJugador = 
    {
      jugador:$(txtMen).val(),
      x:event.pageX,
      y:event.pageY,
      h:parseInt($("#"+$(txtMen).val()).css("height")),
      w:parseInt($("#"+$(txtMen).val()).css("width")),
    }
    $("#"+$(txtMen).val()).css("left",event.pageX);
    $("#"+$(txtMen).val()).css("top",event.pageY);
    // Algu s'ha mogut... Enviar al SERVIDOR
    socket.emit("mover", miJugador);

  });

  //Retorna el JUGADOR que s'ha mogut...
  socket.on("moviendo",function(data)
  {
    var move = 
    {
      left:data.x,
      top:data.y,
      height:data.h,
      width:data.w
    }
    //I el coloca on toca....
    $("#"+data.jugador).css(move);
    //Comprovacio del XOC Usuaris
    $("body .player").on("mousemove",chocar);
  });

  //Comprovacio del SI A XOCAT amb un altre usuari...
  function chocar()
  {
    var el_eliminado;
    var $enimigo=$(this);

    var $typoe=$enimigo.attr("type");  //PLAYER
    var $namee=$enimigo.attr("name");  //NOM
    var $anchoe=parseInt($enimigo.css("width"));
    var $altoe=parseInt($enimigo.css("height"));

    var $jugador=$("#"+$(txtMen).val());  //ID nostre JUDADOR
    var $typeoj=$jugador.attr("type");    //PLAYER
    var $namej=$jugador.attr("name");     //ID del nostre jugador
    var $anchoj=parseInt($jugador.css("width"));
    var $altoj=parseInt($jugador.css("height"));

    //Tu mateix no et pots eliminar ;-)
    if( $typoe=="player" && $namee!== $jugador.text())
    {
      //Si tens el tamany mes gran eliminar i si no ets eliminat.
      if ($anchoe < $anchoj && $altoe < $altoj)
      {
        el_eliminado = $enimigo;
      }else{
        el_eliminado = $jugador;
      }

      //Elimines el enemic o tu ... Segons el Tamany.
      $(el_eliminado).remove();
      //Enviar l'eliminacio als demes...
      socket.emit("jugadoreliminado",$(el_eliminado).text());
    }
  }

  //Accio d'eliminar un Jugador
  socket.on("eliminarJugador",function(data)
  {
    //Enviar eliminacio per el SOCKET a tots els jugadors.
    $("#"+data).remove();
  });

});