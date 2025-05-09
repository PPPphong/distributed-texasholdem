$(document).ready(function () {
  $('#gameDiv').hide();
  $('.modal-trigger').leanModal();
  $('.tooltipped').tooltip({ delay: 50 });
});

var socket = io();
var gameInfo = null;

socket.on('playerDisconnected', function (data) {
  Materialize.toast(data.player + ' 已断开连接', 4000);
});

socket.on('hostRoom', function (data) {
  if (data != undefined) {
    if (data.players.length >= 11) {
      $('#hostModalContent').html(
          '<h5>房间代码:</h5><code>' +
          data.code +
          '</code><br /><h5>警告：房间人数已超过最大限制11人</h5><h5>当前房间玩家</h5>'
      );
      $('#playersNames').html(
          data.players.map(function (p) {
            return '<span>' + p + '</span><br />';
          })
      );
    } else if (data.players.length > 1) {
      $('#hostModalContent').html(
          '<h5>房间代码:</h5><code>' +
          data.code +
          '</code><br /><h5>当前房间玩家</h5>'
      );
      $('#playersNames').html(
          data.players.map(function (p) {
            return '<span>' + p + '</span><br />';
          })
      );
      $('#startGameArea').html(
          '<br /><button onclick=startGame(' +
          data.code +
          ') type="submit" class= "waves-effect waves-light green darken-3 white-text btn-flat">开始游戏</button >'
      );
    } else {
      $('#hostModalContent').html(
          '<h5>房间代码:</h5><code>' +
          data.code +
          '</code><br /><h5>当前房间玩家</h5>'
      );
      $('#playersNames').html(
          data.players.map(function (p) {
            return '<span>' + p + '</span><br />';
          })
      );
    }
  } else {
    Materialize.toast(
        '请输入有效名称！（最长12个字符）',
        4000
    );
    $('#joinButton').removeClass('disabled');
  }
});

socket.on('hostRoomUpdate', function (data) {
  $('#playersNames').html(
      data.players.map(function (p) {
        return '<span>' + p + '</span><br />';
      })
  );
  if (data.players.length == 1) {
    $('#startGameArea').empty();
  }
});

socket.on('joinRoomUpdate', function (data) {
  $('#startGameAreaDisconnectSituation').html(
      '<br /><button onclick=startGame(' +
      data.code +
      ') type="submit" class= "waves-effect waves-light green darken-3 white-text btn-flat">开始游戏</button >'
  );
  $('#joinModalContent').html(
      '<h5>' +
      data.host +
      "的房间</h5><hr /><h5>当前房间玩家</h5><p>您现在已成为房主</p>"
  );

  $('#playersNamesJoined').html(
      data.players.map(function (p) {
        return '<span>' + p + '</span><br />';
      })
  );
});

socket.on('joinRoom', function (data) {
  if (data == undefined) {
    $('#joinModal').closeModal();
    Materialize.toast(
        "请输入有效名称/代码！（最长12个字符且不能重复）",
        4000
    );
    $('#hostButton').removeClass('disabled');
  } else {
    $('#joinModalContent').html(
        '<h5>' +
        data.host +
        "的房间</h5><hr /><h5>当前房间玩家</h5><p>请等待房主开始游戏。离开页面或刷新将断开连接</p>"
    );
    $('#playersNamesJoined').html(
        data.players.map(function (p) {
          return '<span>' + p + '</span><br />';
        })
    );
  }
});

socket.on('dealt', function (data) {
  $('#mycards').html(
      data.cards.map(function (c) {
        return renderCard(c);
      })
  );
  $('#usernamesCards').text(data.username + ' - 我的牌');
  $('#mainContent').remove();
});

socket.on('rerender', function (data) {
  if (data.myBet == 0) {
    $('#usernamesCards').text(data.username + ' - 我的牌');
  } else {
    $('#usernamesCards').text(data.username + ' - 下注金额: $' + data.myBet);
  }
  if (data.community != undefined)
    $('#communityCards').html(
        data.community.map(function (c) {
          return renderCard(c);
        })
    );
  else $('#communityCards').html('<p></p>');
  if (data.currBet == undefined) data.currBet = 0;
  $('#table-title').text(
      '游戏回合 ' +
      data.round +
      '    |    阶段：' +
      data.stage +
      '    |    当前最高注: $' +
      data.topBet +
      '    |    底池: $' +
      data.pot
  );
  $('#opponentCards').html(
      data.players.map(function (p) {
        return renderOpponent(p.username, {
          text: p.status,
          money: p.money,
          blind: p.blind,
          bets: data.bets,
          buyIns: p.buyIns,
          isChecked: p.isChecked,
        });
      })
  );
  renderSelf({
    money: data.myMoney,
    text: data.myStatus,
    blind: data.myBlind,
    bets: data.bets,
    buyIns: data.buyIns,
  });
  if (!data.roundInProgress) {
    $('#usernameFold').hide();
    $('#usernameCheck').hide();
    $('#usernameBet').hide();
    $('#usernameCall').hide();
    $('#usernameRaise').hide();
  }
});

socket.on('gameBegin', function (data) {
  $('#navbar-ptwu').hide();
  $('#joinModal').closeModal();
  $('#hostModal').closeModal();
  if (data == undefined) {
    alert('错误 - 无效游戏');
  } else {
    $('#gameDiv').show();
  }
});

function playNext() {
  socket.emit('startNextRound', {});
}

socket.on('reveal', function (data) {
  $('#usernameFold').hide();
  $('#usernameCheck').hide();
  $('#usernameBet').hide();
  $('#usernameCall').hide();
  $('#usernameRaise').hide();

  for (var i = 0; i < data.winners.length; i++) {
    if (data.winners[i] == data.username) {
      Materialize.toast('你赢得了这局！', 4000);
      break;
    }
  }
  $('#table-title').text('获胜者: ' + data.winners);
  $('#playNext').html(
      '<button onClick=playNext() id="playNextButton" class="btn white black-text menuButtons">开始下一局</button>'
  );
  $('#blindStatus').text(data.hand);
  $('#usernamesMoney').text('$' + data.money);
  $('#opponentCards').html(
      data.cards.map(function (p) {
        return renderOpponentCards(p.username, {
          cards: p.cards,
          folded: p.folded,
          money: p.money,
          endHand: p.hand,
          buyIns: p.buyIns,
        });
      })
  );
});

socket.on('endHand', function (data) {
  $('#usernameFold').hide();
  $('#usernameCheck').hide();
  $('#usernameBet').hide();
  $('#usernameCall').hide();
  $('#usernameRaise').hide();
  $('#table-title').text(data.winner + ' 赢得底池 $' + data.pot);
  $('#playNext').html(
      '<button onClick=playNext() id="playNextButton" class="btn white black-text menuButtons">开始下一局</button>'
  );
  $('#blindStatus').text('');
  if (data.folded == 'Fold') {
    $('#status').text('你已弃牌');
    $('#playerInformationCard').removeClass('theirTurn');
    $('#playerInformationCard').removeClass('green');
    $('#playerInformationCard').addClass('grey');
    $('#usernameFold').hide();
    $('#usernameCheck').hide();
    $('#usernameBet').hide();
    $('#usernameCall').hide();
    $('#usernameRaise').hide();
  }
  $('#usernamesMoney').text('$' + data.money);
  $('#opponentCards').html(
      data.cards.map(function (p) {
        return renderOpponent(p.username, {
          text: p.text,
          money: p.money,
          blind: '',
          bets: data.bets,
        });
      })
  );
});

var beginHost = function () {
  if ($('#hostName-field').val() == '') {
    $('.toast').hide();
    $('#hostModal').closeModal();
    Materialize.toast(
        '请输入有效名称！（最长12个字符）',
        4000
    );
    $('#joinButton').removeClass('disabled');
  } else {
    socket.emit('host', { username: $('#hostName-field').val() });
    $('#joinButton').addClass('disabled');
    $('#joinButton').off('click');
  }
};

var joinRoom = function () {
  if (
      $('#joinName-field').val() == '' ||
      $('#code-field').val() == '' ||
      $('#joinName-field').val().length > 12
  ) {
    $('.toast').hide();
    Materialize.toast(
        '请输入有效名称/代码！（最长12个字符）',
        4000
    );
    $('#joinModal').closeModal();
    $('#hostButton').removeClass('disabled');
    $('#hostButton').on('click');
  } else {
    socket.emit('join', {
      code: $('#code-field').val(),
      username: $('#joinName-field').val(),
    });
    $('#hostButton').addClass('disabled');
    $('#hostButton').off('click');
  }
};

var startGame = function (gameCode) {
  socket.emit('startGame', { code: gameCode });
};

var fold = function () {
  socket.emit('moveMade', { move: 'fold', bet: 'Fold' });
};

var bet = function () {
  if (parseInt($('#betRangeSlider').val()) == 0) {
    Materialize.toast('下注金额必须大于$0！', 4000);
  } else if (parseInt($('#betRangeSlider').val()) < 2) {
    Materialize.toast('最小下注金额为$2', 4000);
  } else {
    socket.emit('moveMade', {
      move: 'bet',
      bet: parseInt($('#betRangeSlider').val()),
    });
  }
};

function call() {
  socket.emit('moveMade', { move: 'call', bet: 'Call' });
}

var check = function () {
  socket.emit('moveMade', { move: 'check', bet: 'Check' });
};

var raise = function () {
  if (
      parseInt($('#raiseRangeSlider').val()) == $('#raiseRangeSlider').prop('min')
  ) {
    Materialize.toast(
        '加注金额必须高于当前最高注！',
        4000
    );
  } else {
    socket.emit('moveMade', {
      move: 'raise',
      bet: parseInt($('#raiseRangeSlider').val()),
    });
  }
};

function renderCard(card) {
  if (card.suit == '♠' || card.suit == '♣')
    return (
        '<div class="playingCard_black" id="card"' +
        card.value +
        card.suit +
        '" data-value="' +
        card.value +
        ' ' +
        card.suit +
        '">' +
        card.value +
        ' ' +
        card.suit +
        '</div>'
    );
  else
    return (
        '<div class="playingCard_red" id="card"' +
        card.value +
        card.suit +
        '" data-value="' +
        card.value +
        ' ' +
        card.suit +
        '">' +
        card.value +
        ' ' +
        card.suit +
        '</div>'
    );
}

function renderOpponent(name, data) {
  var bet = 0;
  if (data.bets != undefined) {
    var arr = data.bets[data.bets.length - 1];
    for (var pn = 0; pn < arr.length; pn++) {
      if (arr[pn].player == name) bet = arr[pn].bet;
    }
  }
  var buyInsText =
      data.buyIns > 0 ? (data.buyIns > 1 ? '次买入' : '次买入') : '';
  if (data.buyIns > 0) {
    if (data.text == 'Fold') {
      return (
          '<div class="col s12 m2 opponentCard"><div class="card grey"><div class="card-content white-text"><span class="card-title">' +
          name +
          ' (已弃牌)</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
          data.blind +
          '<br />' +
          data.text +
          '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
          data.money +
          ' (' +
          data.buyIns +
          ' ' +
          buyInsText +
          ')' +
          '</div></div></div>'
      );
    } else {
      if (data.text == 'Their Turn') {
        if (data.isChecked)
          return (
              '<div class="col s12 m2 opponentCard"><div class="card yellow darken-3"><div class="card-content black-text"><span class="card-title">' +
              name +
              '<br />过牌</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />他们的回合' +
              '</p></div><div class="card-action yellow lighten-1 black-text center-align" style="font-size: 20px;">$' +
              data.money +
              ' (' +
              data.buyIns +
              ' ' +
              buyInsText +
              ')' +
              '</div></div></div>'
          );
        else if (bet == 0) {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card yellow darken-3"><div class="card-content black-text"><span class="card-title">' +
              name +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />他们的回合' +
              '</p></div><div class="card-action yellow lighten-1 black-text center-align" style="font-size: 20px;">$' +
              data.money +
              ' (' +
              data.buyIns +
              ' ' +
              buyInsText +
              ')' +
              '</div></div></div>'
          );
        } else {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card yellow darken-3"><div class="card-content black-text"><span class="card-title">' +
              name +
              '<br />下注: $' +
              bet +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br /><br />他们的回合' +
              '</p></div><div class="card-action yellow lighten-1 black-text center-align" style="font-size: 20px;">$' +
              data.money +
              ' (' +
              data.buyIns +
              ' ' +
              buyInsText +
              ')' +
              '</div></div></div>'
          );
        }
      } else {
        if (data.isChecked)
          return (
              '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
              name +
              '<br />过牌</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />' +
              data.text +
              '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
              data.money +
              ' (' +
              data.buyIns +
              ' ' +
              buyInsText +
              ')' +
              '</div></div></div>'
          );
        else if (bet == 0) {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
              name +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />' +
              data.text +
              '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
              data.money +
              ' (' +
              data.buyIns +
              ' ' +
              buyInsText +
              ')' +
              '</div></div></div>'
          );
        } else {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
              name +
              '<br />下注: $' +
              bet +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />' +
              data.text +
              '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
              data.money +
              ' (' +
              data.buyIns +
              ' ' +
              buyInsText +
              ')' +
              '</div></div></div>'
          );
        }
      }
    }
  }
  else {
    if (data.text == 'Fold') {
      return (
          '<div class="col s12 m2 opponentCard"><div class="card grey"><div class="card-content white-text"><span class="card-title">' +
          name +
          ' (已弃牌)</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
          data.blind +
          '<br />' +
          data.text +
          '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
          data.money +
          '</div></div></div>'
      );
    } else {
      if (data.text == 'Their Turn') {
        if (data.isChecked)
          return (
              '<div class="col s12 m2 opponentCard"><div class="card yellow darken-3"><div class="card-content black-text"><span class="card-title black-text">' +
              name +
              '<br />过牌</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />他们的回合' +
              '</p></div><div class="card-action yellow lighten-1 black-text center-align" style="font-size: 20px;">$' +
              data.money +
              '</div></div></div>'
          );
        else if (bet == 0) {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card yellow darken-3"><div class="card-content black-text"><span class="card-title black-text">' +
              name +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />他们的回合' +
              '</p></div><div class="card-action yellow lighten-1 black-text center-align" style="font-size: 20px;">$' +
              data.money +
              '</div></div></div>'
          );
        } else {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card yellow darken-3"><div class="card-content black-text"><span class="card-title black-text">' +
              name +
              '<br />下注: $' +
              bet +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br /><br />他们的回合' +
              '</p></div><div class="card-action yellow lighten-1 black-text center-align" style="font-size: 20px;">$' +
              data.money +
              '</div></div></div>'
          );
        }
      } else {
        if (data.isChecked)
          return (
              '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
              name +
              '<br />过牌</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />' +
              data.text +
              '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
              data.money +
              '</div></div></div>'
          );
        else if (bet == 0) {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
              name +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />' +
              data.text +
              '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
              data.money +
              '</div></div></div>'
          );
        } else {
          return (
              '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
              name +
              '<br />下注: $' +
              bet +
              '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br />' +
              data.blind +
              '<br />' +
              data.text +
              '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
              data.money +
              '</div></div></div>'
          );
        }
      }
    }
  }
}

function renderOpponentCards(name, data) {
  var bet = 0;
  if (data.bets != undefined) {
    var arr = data.bets[data.bets.length - 1].reverse();
    for (var pn = 0; pn < arr.length; pn++) {
      if (arr[pn].player == name) bet = arr[pn].bet;
    }
  }
  var buyInsText2 =
      data.buyIns > 0 ? (data.buyIns > 1 ? '次买入' : '次买入') : '';
  if (data.buyIns > 0) {
    if (data.folded)
      return (
          '<div class="col s12 m2 opponentCard"><div class="card grey" ><div class="card-content white-text"><span class="card-title">' +
          name +
          ' | 下注: $' +
          bet +
          '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br /><br /></p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
          data.money +
          ' (' +
          data.buyIns +
          ' ' +
          buyInsText2 +
          ')' +
          '</div></div></div>'
      );
    else
      return (
          '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
          name +
          ' | 下注: $' +
          bet +
          '</span><p><div class="center-align"> ' +
          renderOpponentCard(data.cards[0]) +
          renderOpponentCard(data.cards[1]) +
          ' </div><br /><br /><br /><br /><br />' +
          data.endHand +
          '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
          data.money +
          ' (' +
          data.buyIns +
          ' ' +
          buyInsText2 +
          ')' +
          '</div></div></div>'
      );
  } else {
    if (data.folded)
      return (
          '<div class="col s12 m2 opponentCard"><div class="card grey" ><div class="card-content white-text"><span class="card-title">' +
          name +
          ' | 下注: $' +
          bet +
          '</span><p><div class="center-align"><div class="blankCard" id="opponent-card" /><div class="blankCard" id="opponent-card" /></div><br /><br /><br /><br /><br /><br /></p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
          data.money +
          '</div></div></div>'
      );
    else
      return (
          '<div class="col s12 m2 opponentCard"><div class="card green darken-2" ><div class="card-content white-text"><span class="card-title">' +
          name +
          ' | 下注: $' +
          bet +
          '</span><p><div class="center-align"> ' +
          renderOpponentCard(data.cards[0]) +
          renderOpponentCard(data.cards[1]) +
          ' </div><br /><br /><br /><br /><br />' +
          data.endHand +
          '</p></div><div class="card-action green darken-3 white-text center-align" style="font-size: 20px;">$' +
          data.money +
          '</div></div></div>'
      );
  }
}

function renderOpponentCard(card) {
  if (card.suit == '♠' || card.suit == '♣')
    return (
        '<div class="playingCard_black_opponent" id="card"' +
        card.value +
        card.suit +
        '" data-value="' +
        card.value +
        ' ' +
        card.suit +
        '">' +
        card.value +
        ' ' +
        card.suit +
        '</div>'
    );
  else
    return (
        '<div class="playingCard_red_opponent" id="card"' +
        card.value +
        card.suit +
        '" data-value="' +
        card.value +
        ' ' +
        card.suit +
        '">' +
        card.value +
        ' ' +
        card.suit +
        '</div>'
    );
}

function updateBetDisplay() {
  if ($('#betRangeSlider').val() == $('#usernamesMoney').text()) {
    $('#betDisplay').html(
        '<h3 class="center-align">全下 $' +
        $('#betRangeSlider').val() +
        '</h36>'
    );
  } else {
    $('#betDisplay').html(
        '<h3 class="center-align">$' + $('#betRangeSlider').val() + '</h36>'
    );
  }
}

function updateBetModal() {
  $('#betDisplay').html('<h3 class="center-align">$0</h3>');
  document.getElementById('betRangeSlider').value = 0;
  var usernamesMoneyStr = $('#usernamesMoney').text().replace('$', '');
  var usernamesMoneyNum = parseInt(usernamesMoneyStr);
  $('#betRangeSlider').attr({
    max: usernamesMoneyNum,
    min: 0,
  });
}

function updateRaiseDisplay() {
  $('#raiseDisplay').html(
      '<h3 class="center-align">加注至 $' +
      $('#raiseRangeSlider').val() +
      '</h3>'
  );
}

socket.on('updateRaiseModal', function (data) {
  $('#raiseRangeSlider').attr({
    max: data.usernameMoney,
    min: data.topBet,
  });
});

function updateRaiseModal() {
  document.getElementById('raiseRangeSlider').value = 0;
  socket.emit('raiseModalData', {});
}

socket.on('displayPossibleMoves', function (data) {
  if (data.fold == 'yes') $('#usernameFold').show();
  else $('#usernameHide').hide();
  if (data.check == 'yes') $('#usernameCheck').show();
  else $('#usernameCheck').hide();
  if (data.bet == 'yes') $('#usernameBet').show();
  else $('#usernameBet').hide();
  if (data.call != 'no' || data.call == 'all-in') {
    $('#usernameCall').show();
    if (data.call == 'all-in') $('#usernameCall').text('全下跟注');
    else $('#usernameCall').text('跟注 $' + data.call);
  } else $('#usernameCall').hide();
  if (data.raise == 'yes') $('#usernameRaise').show();
  else $('#usernameRaise').hide();
});

function renderSelf(data) {
  $('#playNext').empty();
  $('#usernamesMoney').text('$' + data.money);
  if (data.text == 'Their Turn') {
    $('#playerInformationCard').removeClass('grey');
    $('#playerInformationCard').removeClass('grey');
    $('#playerInformationCard').addClass('yellow');
    $('#playerInformationCard').addClass('darken-2');
    $('#usernamesCards').removeClass('white-text');
    $('#usernamesCards').addClass('black-text');
    $('#status').text('我的回合');
    Materialize.toast('我的回合', 4000);
    socket.emit('evaluatePossibleMoves', {});
  } else if (data.text == 'Fold') {
    $('#status').text('你已弃牌');
    $('#playerInformationCard').removeClass('green');
    $('#playerInformationCard').removeClass('yellow');
    $('#playerInformationCard').removeClass('darken-2');
    $('#playerInformationCard').addClass('grey');
    $('#usernamesCards').removeClass('black-text');
    $('#usernamesCards').addClass('white-text');
    Materialize.toast('你已弃牌', 3000);
    $('#usernameFold').hide();
    $('#usernameCheck').hide();
    $('#usernameBet').hide();
    $('#usernameCall').hide();
    $('#usernameRaise').hide();
  } else {
    $('#status').text('');
    $('#usernamesCards').removeClass('black-text');
    $('#usernamesCards').addClass('white-text');
    $('#playerInformationCard').removeClass('grey');
    $('#playerInformationCard').removeClass('yellow');
    $('#playerInformationCard').removeClass('darken-2');
    $('#playerInformationCard').addClass('green');
    $('#playerInformationCard').removeClass('theirTurn');
    $('#usernameFold').hide();
    $('#usernameCheck').hide();
    $('#usernameBet').hide();
    $('#usernameCall').hide();
    $('#usernameRaise').hide();
  }
  $('#blindStatus').text(data.blind);
}