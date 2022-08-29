local_data = JSON.parse(localStorage.getItem("storage") || "{}");

$("#evt-mode").onclick = () => {
    $("#timer").style.display = "none"
    $("#add-event").style.display = "";
}
$("#evt-cancel").onclick = () => {
    $("#timer").style.display = "";
    $("#add-event").style.display = "none";
}

$("#evt-repeat").onchange = () => {
    for(var k of $$("[id^=repeat-]"))
        k.style.display = "none";
    $("#repeat-" + $("#evt-repeat").value).style.display = "";
}
$("#evt-weekly").onchange = (evt) => {
    var _ = $("#evt-weekly");
    var t = $("#evt-repeat-2");
    $("#evt-plural-2").style.display = _.value == "1" ? "none" : "";
    while(t.rows.length > _.value)
        t.rows[t.rows.length - 1].remove();
    for(var x = t.rows.length; x < _.value; x++) {
        var row = t.insertRow();
        var cell = row.insertCell();
        cell.innerHTML = x + 1;
        for(var d of "SMTWTFS") {
            cell = row.insertCell();
            cell.innerHTML = d;
            cell.classList.add("selectable")
            cell.checked = false;
            cell.onclick = (evt, t = null) => {
                var _ = t || evt.currentTarget;
                var c = $("#evt-color").value
                _.checked = !_.checked;
                _.dataset.checked = Number(_.checked);
                if(_.checked) {
                    _.style.backgroundColor = c;
                    _.style.color = color_contrast(c) > 1.9 ? "#fff" : "#000";
                } else {
                    _.style.backgroundColor = "";
                    _.style.color = "";
                }
            }
        }
    }
}
$("#evt-weekly").onchange();

$("#evt-monthly").onchange = (evt) => {
    var _ = $("#evt-monthly");
    $("#evt-plural-3").style.display = _.value == "1" ? "none" : "";
}
$("#evt-monthly").onchange();

$("#evt-yearly").onchange = (evt) => {
    var _ = $("#evt-yearly");
    var t = $("#evt-repeat-4");
    $("#evt-plural-4").style.display = _.value == "1" ? "none" : "";
    while(t.rows.length > _.value * 2)
        t.rows[t.rows.length - 1].remove();
    for(var x = t.rows.length / 2; x < _.value; x++) {
        var row = t.insertRow();
        var cell = row.insertCell();
        cell.innerHTML = x + 1;
        var months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        for(var d of months) {
            if(d == "Jul") {
                row = t.insertRow();
                row.insertCell();
            }
            cell = row.insertCell();
            cell.innerHTML = d;
            cell.classList.add("selectable")
            cell.checked = false;
            cell.onclick = (evt, t = null) => {
                var _ = t || evt.currentTarget;
                var c = $("#evt-color").value
                _.checked = !_.checked;
                _.dataset.checked = Number(_.checked);
                if(_.checked) {
                    _.style.backgroundColor = c;
                    _.style.color = color_contrast(c) > 1.9 ? "#fff" : "#000";
                } else {
                    _.style.backgroundColor = "";
                    _.style.color = "";
                }
            }
        }
    }
}
$("#evt-yearly").onchange();

$("#evt-color").value = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
$("#evt-color").onchange = () => {
    for(var k of $$("td.selectable[data-checked='1']")) {
        k.click(0, k);
        k.click(0, k);
    }
}

$("#evt-name").value = "";
$("#evt-desc").value = "";
var now = new Date();
$("#evt-start").value = now.toISOString().split("T")[0] + "T00:00"
$("#evt-end").value = now.toISOString().split("T")[0] + "T23:59"
$("#evt-repeat").value = 0;
$("#evt-repeat").onchange();
$("#evt-until-1").value = "";
$("#evt-until-2").value = "";
$("#evt-until-3").value = "";
$("#evt-until-4").value = "";

function color_contrast(hex) {
    var color_contrast = 0.2126 * parseInt(hex.slice(1, 3), 16) + 0.7152 * parseInt(hex.slice(3, 5), 16) + 0.0722 * parseInt(hex.slice(5, 7), 16);
    var white_contrast = 255;
    return (white_contrast + 0.05) / (color_contrast + 0.05);
}

function rm_agenda() {
    if(!local_data["agenda"][$("#evt-exist").value])
        return
    if(!confirm("Delete this event?"))
        return
    delete local_data["agenda"][$("#evt-exist").value];
    localStorage.setItem("storage", JSON.stringify(local_data));
    location.reload();
}

function add_agenda() {
    var agenda = {};
    agenda["name"] = $("#evt-name").value.trim().replace(/</g, "&lt;");
    agenda["desc"] = $("#evt-desc").value.trim().replace(/</g, "&lt;");
    agenda["start"] = $("#evt-start").value;
    agenda["end"] = $("#evt-end").value;
    agenda["repeat"] = Number($("#evt-repeat").value);
    agenda["until"] = agenda["repeat"] ? $("#evt-until-" + agenda["repeat"]).value : $("#evt-end").value;
    agenda["color"] = $("#evt-color").value

    switch(agenda["repeat"]) {
        case 1:
            agenda["repeater"] = Number($("#evt-daily").value);
            break;
        case 2:
            agenda["repeater"] = [];
            for(var k of $$("#evt-repeat-2 td.selectable"))
                agenda["repeater"].push(k.checked);
            break;
        case 3:
            agenda["repeater"] = $("#evt-monthly").value;
            break;
        case 4:
            agenda["repeater"] = [];
            for(var k of $$("#evt-repeat-4 td.selectable"))
                agenda["repeater"].push(k.checked);
            break;
    }

    if(!local_data["agenda"])
        local_data["agenda"] = {}
    if($("#evt-exist").value.length == 8) {
        local_data["agenda"][$("#evt-exist").value] = agenda
    } else {
        agenda_id = "00000000"
        while(local_data["agenda"][agenda_id]) {
            agenda_id = "";
            for(var x = 0; x < 8; x++)
                agenda_id += Math.floor(Math.random() * 16).toString(16)
        }
        local_data["agenda"][agenda_id] = agenda;
    }
    localStorage.setItem("storage", JSON.stringify(local_data));
    location.reload();
}

$("#evt-exist").onkeydown = (evt) => {
    if($("#evt-exist").value.length > 8)
        return evt.preventDefault();
    if(!"abcdef1234567890".includes(evt.key) && evt.key.length == 1)
        return evt.preventDefault();
}
$("#evt-exist").onkeyup = (evt) => {
    $("#evt-exist").value = $("#evt-exist").value.slice(0, 8);
    agenda = local_data["agenda"][$("#evt-exist").value];
    if(!agenda) {
        $("#evt-rm").style.display = "none";
        return $("#evt-add").innerHTML = "Add event"
    }
    $("#evt-rm").style.display = "";
    $("#evt-add").innerHTML = "Edit event"
    $("#evt-name").value = agenda["name"];
    $("#evt-desc").value = agenda["desc"];
    $("#evt-repeat").value = agenda["repeat"];
    $("#evt-repeat").onchange();
    $("#evt-start").value = agenda["start"];
    $("#evt-end").value = agenda["end"];
    $("#evt-color").value = agenda["color"];

    for(var k of $$("td.selectable[data-checked='1']"))
        k.onclick(0, k);
    switch(agenda["repeat"]) {
        case 1:
            $("#evt-daily").value = agenda["repeater"];
            break;
        case 2:
            n = 0;
            for(var k of $$("#evt-repeat-2 td.selectable")) {
                if(agenda["repeater"][n])
                    k.onclick(0, k);
                n++;
            }
            break;
        case 3:
            $("#evt-monthly").value = agenda["repeater"];
            break;
        case 4:
            n = 0;
            for(var k of $$("#evt-repeat-4 td.selectable")) {
                if(agenda["repeater"][n])
                    k.onclick(0, k);
                n++;
            }
            break;
    }

    if(agenda["repeat"])
        $("#evt-until-" + agenda["repeat"]).value = agenda["until"];
}

function refresh_timer() {
    var time = new_time();
    var agendas = Array.from($$("#agenda-list > div"));
    if($("#count-mode").checked) {
        for(var agenda of agendas) {
            if(Number(agenda.dataset.end) > time)
                break;
        }
    } else {
        agendas.reverse();
        for(var agenda of agendas) {
            if(Number(agenda.dataset.start) < time)
                break;
        }
    }
//     console.log(time, agenda);
    var name = "";
    var t = 0;
    var agenda2 = agenda;
    if($("#count-mode").checked) {
        while(!name) {
            name = agenda2.dataset.name;
            agenda2 = agenda2.nextElementSibling;
        }
        $("#until-start").textContent = "Until"
        $("#until-end").textContent = (agenda.className == "card-agenda") ? "ends" : "begins"
        t = Number(agenda.dataset.end) - time;
    } else {
        while(!name) {
            name = agenda2.dataset.name;
            agenda2 = agenda2.previousElementSibling;
        }
        $("#until-start").textContent = "Since"
        $("#until-end").textContent = (agenda.className == "card-agenda") ? "started" : "ended"
        t = time - Number(agenda.dataset.start);
    }
    $("#until-name").textContent = name
    m = Math.floor(t / 60);
    t = (t % 60) + "";
    h = Math.floor(m / 60) + "";
    m = (m % 60) + "";
    if(h == 0 && m == 0) {
        $("#countdown").textContent = "--:--:" + t.padStart(2, '0');
    } else if(h == 0) {
        $("#countdown").textContent = "--:" + m.padStart(2, '0') + ':' + t.padStart(2, '0');
    } else {
        $("#countdown").textContent = h.padStart(2, '0') + ':' + m.padStart(2, '0') + ':' + t.padStart(2, '0');
    }
}

function new_time(hours = null, minutes = null) {
    var time = new Date();
    if(hours == null || minutes == null) {
        return time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds();
    }
    time.setMilliseconds(0);
    time.setSeconds(0);
    time.setMinutes(minutes);
    time.setHours(hours);

//     time.setYear(emu_year)
//     time.setMonth(emu_month);
//     time.setDate(emu_day);
    return time;
}

first_event = new_time(0, 0);
last_event = new_time(23, 59);
last_name = "today"

function agenda_today(agenda) {
    var start = new Date(agenda["start"]);
    start.setHours(0);
    start.setMinutes(0);
    var now = new_time(0, 0);
    switch(agenda["repeat"]) {
        case 0:
            return Number(now) == Number(start);
        case 1:
            while(start < now)
                start.setSeconds(86400 * agenda["repeater"]);
            return Number(now) == Number(start);
        case 2:
            start.setSeconds(-86400 * start.getDay()); // Set to beginning of week
            while(start < now)
                start.setSeconds(86400 * agenda["repeater"].length);
            if(start > now)
                start.setSeconds(-86400 * agenda["repeater"].length);
            var diff_days = Math.floor((now - start) / 86400000);
            return agenda["repeater"][diff_days];
        case 3:
            while(start < now)
                start.setMonth(start.getMonth() + agenda["repeater"]);
            return Number(now) == Number(start);
        case 4:
            start.setMonth(0); // Set to beginning of year
            while(start < now)
                start.setMonth(agenda["repeater"].length);
            if(start > now)
                start.setMonth(-agenda["repeater"].length);
            var diff_months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
            if(!agenda["repeater"][diff_months])
                return false
            return start.getDate() == now.getDate();
    }
}

function recreate_agenda() {
    for(var k of $$("#agenda-list *"))
        k.remove();

    $("#agenda-list").insertAdjacentHTML("beforeend", `<div data-name='today' style='height:0px' data-start='0' data-end='0'></div>`);

    conflicts = []
    for(var agenda in local_data["agenda"]) {
        agenda_data = local_data['agenda'][agenda];
        if(!agenda_today(agenda_data))
            continue;
        start_time = new_time(...agenda_data['start'].split('T')[1].split(':'));
        end_time = new_time(...agenda_data['end'].split('T')[1].split(':'));
        dataStart = first_event.getHours() * 60 + first_event.getMinutes();
        dataEnd = start_time.getHours() * 60 + start_time.getMinutes();
        if(dataEnd > dataStart) {
            conflicts.push(agenda);
            continue;
        }
        $("#agenda-list").insertAdjacentHTML("beforeend", `<div style='height:${(dataEnd - dataStart)/2}px' data-start='${dataStart * 60}' data-end='${dataEnd * 60}'></div>`);
        dataStart = dataEnd;
        dataEnd = end_time.getHours() * 60 + end_time.getMinutes();
        $("#agenda-list").insertAdjacentHTML("beforeend", `\
    <div class='card-agenda' data-id="${agenda}" style='background-color:${agenda_data['color'] || "#" + Math.floor(Math.random() * 0x1000000).toString(16)}; height:${(dataEnd - dataStart)/2}px' data-start='${dataStart * 60}' data-end='${dataEnd * 60}' data-name='${agenda_data['name']}'>
        <h4 class='Bright' style='margin:0'>${agenda_data['name']}</h4>
        <div>${agenda_data['desc']}</div>
    </div>`);
        first_event = end_time;
    }
    for(var agenda of $$(".card-agenda"))
        agenda.onclick = (evt) => {
            $("#evt-exist").value = evt.currentTarget.dataset.id;
            $("#evt-exist").onkeyup();
            $("#timer").style.display = "none";
            $("#add-event").style.display = "";
        }

    dataStart = first_event.getHours() * 60 + first_event.getMinutes();
    dataEnd = last_event.getHours() * 60 + last_event.getMinutes();
    $("#agenda-list").insertAdjacentHTML("beforeend", `<div data-name='tomorrow' style='height:${(dataEnd - dataStart)/2}px' data-start='${dataStart * 60}' data-end='${dataEnd * 60}'></div><sm style='text-align:right;display:block;'><i>~End of the day~</i></sm>`);

}

recreate_agenda();

if(Number(localStorage.getItem("agenda_count_mode") || 1))
    $("#count-mode").checked = 1
else
    $("#count-mode2").checked = 1
refresh_timer();
var perfect_time = new_time();
var perfect_sync = window.setInterval(() => {
    if(perfect_time == new_time())
        return
    window.clearInterval(perfect_sync);
    refresh_timer();
    perfect_sync = window.setInterval(refresh_timer, 1000);
});


$("#evt-exist").value = "";
$("#evt-exist").onkeyup();
