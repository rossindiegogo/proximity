/* http://ellesite.altervista.org/Tribs/Proximity.js */

var worldSpeed = 1;  

var speed = {      spear: 18 / worldSpeed,      sword: 22 / worldSpeed,      archer: 18 / worldSpeed,      axe: 18 / worldSpeed,      spy: 9 / worldSpeed,      light: 10 / worldSpeed,      marcher: 11 / worldSpeed,      heavy: 11 / worldSpeed,      ram: 30 / worldSpeed,      catapult: 30 / worldSpeed,      knight: 10 / worldSpeed,      snob: 35 / worldSpeed,      militia: 0 / worldSpeed  };  

var win = (window.main || self);  var destby = win.game_data.village.coord; 

var win = (window.main || self);
var destby = win.game_data.village.coord;
function zeroPad(number, length) {
    var n = number.toString();
    while (n.length < length) {
        n = "0" + n;
    }
    return n;
}

/*Load the file by using this method created by Dale*/
function fnAjax(url, method, params, type, isAsync) { var error = null; var payload = null; $.ajax({ 'async': isAsync, 'url': url, 'data': params, 'dataType': type, 'type': String(method || 'GET').toUpperCase(), 'error': function (req, status, err) { error = 'ajax: ' + status; }, 'success': function (data, status, req) { payload = data; } }); if (error) { throw (error); } return payload; }

/*Loads the config file so it can be accessed*/
var worldConfigFile = $(fnAjax('/interface.php', 'GET', { 'func': 'get_config' }, 'xml', false)).find('config');

/*Collects the unit speed, whether or not Pali/Archer exist*/
var UnitSpeedCheck = (worldConfigFile.find('unit_speed').text());
var WorldSpeedCheck = (worldConfigFile.find('speed').text());
var worldSpeed = UnitSpeedCheck * WorldSpeedCheck;
var speed = {
    spear: 18 / worldSpeed,
    sword: 22 / worldSpeed,
    archer: 18 / worldSpeed,
    axe: 18 / worldSpeed,
    spy: 9 / worldSpeed,
    light: 10 / worldSpeed,
    marcher: 11 / worldSpeed,
    heavy: 11 / worldSpeed,
    ram: 30 / worldSpeed,
    catapult: 30 / worldSpeed,
    knight: 10 / worldSpeed,
    snob: 35 / worldSpeed,
    militia: 0 / worldSpeed
};


destby = prompt("Choose Destination", destby);
if (destby) {
    destby = destby.split("|").map(function (x) {
        return parseInt(x, 10);
    });
    var maxdelay;
    while (true) {
        maxdelay = prompt("Select a maximum duration (eg, 3:48:50), leave blank for no maximum limit", "");
        maxdelay = (maxdelay ? maxdelay.split(":") : []);

        while (maxdelay.length < 3) {
            maxdelay.splice(0, 0, 0);
        }

        if (maxdelay.length == 3) {
            break;
        }
    }

    maxdelay = maxdelay.map(function (x) {
        return parseInt(x, 10);
    });

    var maxdelaytime = (maxdelay[0] * 60 * 60) + (maxdelay[1] * 60) + maxdelay[2];
    var diffx, diffy;

    function fnGetMode() {
        var vmode = win.game_data.mode;

        /* HACK: fix null mode */
        if (!vmode) {
            vmode = win.$('#overview_menu td[class="selected"] a').attr('href').match(/mode\=(\w*)/i);
            vmode = vmode ? vmode[1] : null;
        }

        return vmode;
    }

    if ((win.game_data.screen == "overview_villages") && (fnGetMode() == "combined")) {
        var t = win.$("#combined_table").get(0);
        var coord_cell = ((win.$('[src*="note.png"],[class*="note-icon"]').length > 0) ? 1 : 0);
        var j, rs, dist, by, unit, time, h, mm, s, res, villageID;
        if (t.rows[0].cells[coord_cell].innerHTML.match(/Village/i)) {
            rs = [];

            for (j = 1; j < t.rows.length; j++) {
                by = win.$(t.rows[j].cells[coord_cell]).text().match(/\d+\|\d+/g);
                by = by[by.length - 1].split("|").map(function (x) {
                    return parseInt(x, 10);
                });
                diffx = destby[0] - by[0];
                diffy = destby[1] - by[1];
                dist = Math.sqrt(diffx * diffx + diffy * diffy);
                villageID = win.$(t.rows[j].cells[coord_cell]).html().match(/village\=\d+/);

                for (c = 0; c < t.rows[j].cells.length; c++) {
                    unit = t.rows[0].cells[c].innerHTML.match(/graphic\/unit\/unit_(\w+).png/);
                //    alert(unit);
                    if (unit) {
                        unit = unit[1];
                        time = dist * speed[unit] * 60;
                        h = zeroPad(Math.floor(time / 3600), 2);
                        mm = zeroPad(Math.floor(time / 60) % 60, 2);
                        s = zeroPad(Math.round(time) % 60, 2);
                        res = h + ":" + mm + ":" + s;

                        if (t.rows[j].cells[c].className == "hidden") {
                            t.rows[j].cells[c].innerHTML = res;
                        } else if (maxdelaytime == 0) {
                            t.rows[j].cells[c].innerHTML = "<b>" + t.rows[j].cells[c].innerHTML + "</b><br>" + res;
                        } else if (time < maxdelaytime) {
                            t.rows[j].cells[c].innerHTML = "<font color=\"green\"><b>" + t.rows[j].cells[c].innerHTML + "</b><br>" + res + "</font>";
                        } else {
                            t.rows[j].cells[c].innerHTML = "<font color=\"red\"><b>" + t.rows[j].cells[c].innerHTML + "</b><br>" + res + "</font>";
                        }
                    }
                }

                rs.push([dist, villageID, t.rows[j].innerHTML]);
            }

            rs = rs.sort(function (a, b) {
                return a[0] - b[0];
            });
            while (t.rows.length > 1) {
                t.deleteRow(1);
            }

            win.$("<th>Distance</th><th>Rp</th>").insertAfter(win.$(t.rows[0]).find("th:eq(" + coord_cell + ")"));
            for (j = 0; j < rs.length; j++) {
                rr = t.insertRow(j + 1);
                rr.innerHTML = rs[j][2];
                rr.insertCell(coord_cell + 1).innerHTML = Math.round(rs[j][0] * 100) / 100;
                rr.insertCell(coord_cell + 2).innerHTML = '<a href="' + win.game_data.link_base_pure.replace(/village\=\d*/i, rs[j][1]).replace(/screen\=\w*/i, 'screen=place') + '" target="_blank"><img src="graphic/buildings/place.png" alt="Rally point" width="16" height="16"/></a>';
            }

            for (j = 1; j < t.rows.length; j++) {
                t.rows[j].className = "nowrap row_" + ((j % 2) ? "b" : "a");
            }
        }
    }
}

void (0);


/*
javascript: 
$.getScript("http://dl.dropbox.com/u/24469843/Tribalwars/Scripts/MultiPurposeProximity.js");
void(0);

javascript: 
var worldSpeed=1;
var speed={
spear:18/worldSpeed,
sword:22/worldSpeed,
archer:18/worldSpeed,
axe:18/worldSpeed,
spy:9/worldSpeed,
light:10/worldSpeed,
marcher:11/worldSpeed,
heavy:11/worldSpeed,
ram:30/worldSpeed,
catapult:30/worldSpeed,
knight:10/worldSpeed,
snob:35/worldSpeed,
militia:0/worldSpeed
};
var win=(window.main||self);
var destby=win.game_data.village.coord;
$.getScript("http://dl.dropbox.com/u/24469843/Tribalwars/Scripts/MultiPurposeProximity.js");
void(0);
*/
; void 0;
