function findzero(arr) {
    var id = [0] //becomes array, just number w/o []
    var k = 0
    for (let i = 0; i < (arr.length - 1); i++) {
        if (Math.sign(arr[i]) == 0) {
            id[k] = i
            k++
        } else if (Math.sign(arr[i]) != Math.sign(arr[i + 1])) {
            id[k] = i
            k++
        }
    }
    return id
}

function drawfunc(geo) {
    let w = geo.b
    let h = geo.h;
    let nbars = geo.nbars;
    let nbars_p = geo.nbars_p;
    let dbar = geo.dbar;
    let dbar_p = geo.dbar_p;
    let nmax = math.floor((w - 2 * (dbar + 0.01)) / (2 * dbar))
    if (nbars <= nmax) {
        layers = 1;
        layer1 = nbars;
        d = h - (1.5 * dbar + 0.01);
    }
    else if (nbars > nmax) {
        let layers = 2;
        layer1 = nmax;
        layer2 = nbars - nmax;
        d = h - (layer2 * (2.5 * dbar + 0.01) + layer1 * (1.5 * dbar + 0.01)) / (nbars)
    }
    d_p = (1.5 * dbar_p + 0.01)
    //x-y-location of bottom bars
    var barXSpace = (w - (3 * dbar + (2 * 0.01)));
    if (nbars > nmax && layer2 > 1) {
        var x_bar1 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
        var x_bar2 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer2 - 1), true)._data
        var x_bar = x_bar1.concat(x_bar2);
    }
    else if (nbars > nmax && layer2 == 1) {
        var x_bar1 = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
        var x_bar = x_bar1.concat([w / 2]);
    }
    else if (nbars <= nmax) {
        var x_bar = math.range(0.01 + 1.5 * dbar, w - 1.5 * dbar, barXSpace / (layer1 - 1), true)._data
    }

    var y_bar = []
    for (let i = 0; i <= nbars; i++) {
        if (i < nmax) {
            y_bar[i] = dbar + 0.01 + 0.5 * dbar;
        }
        else {
            y_bar[i] = dbar + 0.01 + 0.5 * dbar + dbar + dbar;
        }
    }

    //x-y-location of top bars
    var barpXSpace = (w - (3 * dbar_p + (2 * 0.01)));
    var x_bar_p = math.range(0.01 + 1.5 * dbar_p, w - 1.5 * dbar_p - 0.01, barpXSpace / (nbars_p - 1), true)._data
    y_bar_p = h - 0.01 - 1.5 * dbar_p;

    //draw cross section
    section_geom = [
        {
            type: 'rect', x0: 0, y0: 0, x1: w, y1: h, line: { color: 'rgba(0, 0, 0, 1)', width: 2 }, fillcolor: 'rgba(150, 150, 150, 0.7)',
        },
    ]

    //draw bottom bars
    var new_circle = [];
    for (let i = 0; i < nbars; i++) {
        new_circle[i] = {
            type: 'circle', x_ref: 1, y_ref: 1, x0: x_bar[i] - 0.5 * dbar, y0: y_bar[i] - 0.5 * dbar, x1: x_bar[i] + 0.5 * dbar, y1: y_bar[i] + 0.5 * dbar, fillcolor: 'rgba(0, 0, 0, 1)',
        }
    }
    section_geom = section_geom.concat(new_circle)

    //draw upper bars
    var new_circle_p = []
    for (let i = 0; i < nbars_p; i++) {
        new_circle_p[i] = {
            type: 'circle', x_ref: 1, y_ref: 1, x0: x_bar_p[i] - dbar_p / 2, y0: y_bar_p - dbar_p / 2, x1: x_bar_p[i] + dbar_p / 2, y1: y_bar_p + dbar_p / 2, fillcolor: 'rgba(0, 0, 0, 1)',
        }

    }
    section_geom = section_geom.concat(new_circle_p)
}

function calcMtrl() {
    f_cm = document.getElementById("fc").value * 1e6 / 1.5
    eps_cu = 3.5e-3;
    eps_c1 = (0.7 * (f_cm * 10 ** -6) ** 0.31) * 10 ** -3;
    eps_c2 = 2e-3;
    eps_c3 = 1.75e-3;
    E_cm = 30e9;
    f_ctm = 2.2e6;
    eps_c = math.range(0, eps_cu, eps_cu / 100, true)._data;
    var n = math.divide(eps_c, eps_c1);
    var k = 1.05 * E_cm * math.abs(eps_c1) / f_cm;
    var a = math.multiply(f_cm, math.subtract(math.multiply(k, n), math.square(n)));
    var b = math.add(math.multiply(k - 2, n), 1);
    sigma_c = math.dotDivide(a, b);
    f_yd = document.getElementById("fy").value * 1e6 / 1.5;
    E_s = 200e9;
    eps_sy = f_yd / E_s;
    eps_s = math.range(0, 2e-2, 2e-2 / 100)._data
    mtrl_sigma_s = [];
    for (let i = 0; i < eps_s.length - 1; i++) {
        if (eps_s[i] <= eps_sy) {
            mtrl_sigma_s[i] = eps_s[i] * E_s;
        } else {
            mtrl_sigma_s[i] = f_yd;
        }
    }
}

function calcGeometry() {
    //Geometry and reinforcement
    geo = {};
    $(".geom").each(function () {
        geo[$(this).attr("id")] = $(this).val();
    });
    geo.b /= 1000
    geo.h /= 1000
    geo.dbar /= 1000
    geo.dbar_p /= 1000

    geo.A_s = geo.nbars * (geo.dbar / 2) ** 2 * Math.PI;
    geo.A_sp = geo.nbars_p * (geo.dbar_p / 2) ** 2 * Math.PI;

    //calculate d and d_p from geometry
    drawfunc(geo)

}

function calc() {
    Mc = [];
    curvature = [];
    yc_out = [];
    xc_out = [];
    cncrt_tp = [];
    sigma_s_out = [];
    sigma_sp_out = [];
    eps_c_out = [];
    eps_s1_out = [];
    eps_sp_out = [];
    A_s = geo.A_s;
    A_sp = geo.A_sp;
    b = geo.b;
    h = geo.h;
    var xn = math.range(d_p, d - d_p, d / 500, true);
    var id_zero = [0];
    xn = xn._data;
    //Calculate location of NA
    for (let i = 1; i < eps_c.length; i++) {
        //Get smaller part of stress strain curve
        let eps_c_sub = eps_c.slice(0, i + 1);
        eps_c_out[i] = eps_c_sub[eps_c_sub.length - 1];
        let sigma_sub = sigma_c.slice(0, i + 1);
        let sigma_sub_mean = math.mean(sigma_sub);
        //stress in top and bottom reinforcement at different x and different eps_c_max
        var sigma_s = math.dotMultiply(math.dotMultiply(math.dotDivide(math.max(eps_c_sub), xn), math.subtract(d, xn)), E_s);
        sigma_s = sigma_s.map(a => a > f_yd ? f_yd : a); //cap at yield stress
        var sigma_sp = math.dotMultiply(math.dotMultiply(math.dotDivide(math.max(eps_c_sub), xn), math.subtract(xn, d_p)), E_s);
        sigma_sp = sigma_sp.map(a => a > f_yd ? f_yd : a); //cap at yield stress
        //force equilibrium Fcc - Fs - Fct = 0, iterate for different x
        let forceT = math.dotMultiply(sigma_s, A_s); //force tensile reinforcement
        let forceC = math.add(math.dotMultiply(sigma_sub_mean * b, xn), math.dotMultiply(sigma_sp, A_sp)) //force compression
        let forceEq = math.subtract(forceC, forceT); //force equilibrium
        id_zero[i] = findzero(forceEq); //find zero crossing x

        yc_out[i] = math.range(d - xn[id_zero[i]], d, (d - (d - xn[id_zero[i]])) / (eps_c_sub.length - 1), true);
        yc_out[i] = yc_out[i]._data;
        yc_out[i] = math.add(yc_out[i], h - d)


        xc_out[i] = math.divide(sigma_sub, 1000000);

        sigma_s_out[i] = sigma_s[id_zero[i]] / 1000000;
        sigma_sp_out[i] = sigma_sp[id_zero[i]] / 1000000;
        eps_s1_out[i] = math.max(eps_c_sub) * (d - xn[id_zero[i]]) / (xn[id_zero[i]])
        eps_sp_out[i] = math.max(eps_c_sub) * (xn[id_zero[i]] - d_p) / (xn[id_zero[i]])
        
        cncrt_tp[i] = math.divide(math.sum(math.dotMultiply(sigma_sub, yc_out[i])), math.sum(sigma_sub))
        Mc[i] = sigma_s_out[i] * A_s * (cncrt_tp[i]) * 1000;
        curvature[i] = 1 / ((d - xn[id_zero[i]]) / eps_s1_out[i])
    }

    //Draw polygons from strss and strain distributions
    pathdefs = []
    for (let i = 1; i < xc_out.length; i++) {
        pathdef = 'M0,' + h

        for (let j = 0; j < xc_out[i].length; j++) {
            substr = 'L' + Math.round(xc_out[i][j] * 10) / 10 + ',' + (yc_out[i][j]);
            pathdef = pathdef.concat(substr)
        }
        pathdefs[i] = pathdef + 'L0,' + h + 'Z';
    }

    return
}

function plotFunc() {
    var slider = document.getElementById("myRange")
    k = slider.value;
    ax = document.getElementById('myDiv');
    ax2 = document.getElementById('myDiv2');
    ax3 = document.getElementById('myDiv3');
    let w = geo.b;
    let h = geo.h;
    //Define data
    stress_dist_shape = {
        type: 'path', path: pathdefs[k], line: { width: 1, color: 'rgb(0,0,0)' }, fillcolor: 'rgba(0,0,255,0.5)',
        xref: 'x2', yref: 'y2'
    }
    var trace11 = {
        x: [0, -sigma_s_out[k] / (10)],
        y: [h - d, h - d],
        xaxis: 'x2', yaxis: 'y2', mode: 'line'
    }
    var trace12 = {
        x: [0, sigma_sp_out[k] / (10)],
        y: [h - d_p, h - d_p],
        xaxis: 'x2', yaxis: 'y2', mode: 'line'
    }
    var trace13 = {
        x: [eps_c[k], -eps_s1_out[k]],
        y: [h, d_p],
        xaxis: 'x3', yaxis: 'y3', mode: 'line'
    }
    var trace14 = {
        x: 0,
        y: 0,
        mode: 'line'
    }
    var trace21 = {
        x: curvature.slice(0,k),
        y: Mc.slice(0,k),
        mode: 'line'
    }

    var trace23 = {
        x: eps_s1_out.slice(1,k),
        y: math.divide(sigma_s_out.slice(1,k), 1),
        mode: "line",
        yaxis: "y",
        name: "Steel (bottom)"
    }

    var trace24 = {
        x: eps_sp_out.slice(1,k),
        y: math.divide(sigma_sp_out.slice(1,k), 1),
        mode: "line",
        yaxis: "y",
        name: "Steel (top)",
        line: {
            dash: 'dot',
            width: 4
          }
    }

//    var trace24 = {
//        x: [eps_s1_out[k], eps_s1_out[k]],
//        y: [sigma_s_out[k], sigma_s_out[k]],
//        mode: "scatter",
//        yaxis: "y"
//    }
    var trace25 = {
        x: eps_c.slice(0,k),
        y: math.divide(sigma_c.slice(0,k), 1000000),
        mode: "line",
        yaxis: "y2",
        name: "Concrete"
    }
 //   var trace26 = {
 //       x: [eps_c_out[k], eps_c_out[k]],
 //       y: [xc_out[k][xc_out[k].length - 1], xc_out[k][xc_out[k].length - 1]],
 //       mode: "scatter",
 //       yaxis: "y2"
 //   }

 var config = {responsive: true}  

    var layout = {
        paper_bgcolor:'rgba(0,0,0,0)', 
        grid: {
            rows: 1, columns: 3, pattern: 'independent',
            xgap: 0.2, ygap: 0,
            subplots:['xy2','x2y2','x3y2'],
        },
        
        xaxis: { range: [0, w] },
        yaxis: { range: [0, h], scaleanchor: "x" },
        xaxis2: { range: [-50, 50], title: "stress (scaled)" },
        yaxis2: { range: [0, h] },
        xaxis3: { range: [-0.03, 0.0035], title: "strain" },
        yaxis3: { range: [0, h] },
        shapes: section_geom.concat(stress_dist_shape),
        showlegend: false,
        annotations: [{
            text: (Math.round(eps_c_out[k] * 10000) / 10) + "‰",
            font: {
                size: 12,
                color: 'black',
            },
            showarrow: true,
            align: 'center',
            x: eps_c_out[k],
            y: h,
            xref: 'x3',
            yref: 'y3',
        }],
        margin: {
            l: 50,
            r: 10,
            b: 50,
            t: 50,
            pad: 4
          },
    };

    const ymax = Math.ceil(Math.max(...Mc.slice(2, Mc.length))) * 1.1;
    const xmax = Math.max(...curvature.slice(2, curvature.length)) * 1.1;

    var layout3 = {
        margin: {
            l: 50,
            r: 10,
            b: 50,
            t: 10,
            pad: 4
          },
        yaxis: {
            title:"Moment / kNm",
            range: [0, ymax] },
        xaxis: {
            title:"curvature / r<sup> -1</sup>",
            range: [0, xmax] },
        showlegend: false,
        paper_bgcolor:'rgba(0,0,0,0)',        
    }

    var layout2 = {
        paper_bgcolor:'rgba(0,0,0,0)', 
        xaxis: {domain: [0.15, 0.85],
            range:[0,0.006],
            title:"strain / -"
        },
        yaxis: {
          title: 'Steel stress / MPa',
          showgrid: false,
          rangemode: 'tozero',
        },
        yaxis2: {
          title: 'Concrete stress / MPa',
          anchor: 'free',
          overlaying: 'y',
          side: 'right',
          position: 0.85,
          showgrid: false,
          showline: true,
          rangemode: 'tozero',
        },
        legend: {
            x: 0.8,
            xanchor: 'right',
            y: 0.05
        },
        margin: {
            l: 10,
            r: 10,
            b: 50,
            t: 10,
            pad: 4
          },
      };





    var data = [trace11, trace12, trace13, trace14]
    var data2 = [trace23, trace24,trace25]
    var data3 = [trace21]

      
    Plotly.newPlot(ax, data, layout,config);
        ax.layout.yaxis2.range[1] = ax.layout.yaxis.range[1]
        ax.layout.yaxis3.range[1] = ax.layout.yaxis.range[1]
        ax.layout.yaxis2.range[0] = ax.layout.yaxis.range[0]
        ax.layout.yaxis3.range[0] = ax.layout.yaxis.range[0]
        Plotly.redraw(ax)

    Plotly.newPlot(ax2, data2, layout2,config);
    Plotly.newPlot(ax3, data3, layout3,config);
}

window.onresize = () => {

      plotFunc()
      
}