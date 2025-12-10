import React, { useState, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const BuscarParticipante = ({ initialCedula }) => {
  const [cedula, setCedula] = useState(initialCedula || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [participante, setParticipante] = useState(null);
  const printRef = useRef(null);

  const buscar = async (e) => {
    e && e.preventDefault();
    if (!cedula) return setError('Ingrese una cédula');
    setLoading(true);
    setError(null);
    setParticipante(null);

    try {
      const resp = await axios.get(`/api/participante/cedula/${cedula}`);
      if (resp.data && resp.data.success) {
        setParticipante(resp.data.participante);
      } else {
        setError(resp.data.message || 'No se encontró participante');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al consultar');
    } finally {
      setLoading(false);
    }
  };

  // Si el componente recibe una cédula inicial por props, buscar automáticamente
  React.useEffect(() => {
    if (!initialCedula) return;

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      setParticipante(null);
      try {
        const resp = await axios.get(`/api/participante/cedula/${initialCedula}`);
        if (resp.data && resp.data.success) {
          setParticipante(resp.data.participante);
        } else {
          setError(resp.data.message || 'No se encontró participante');
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Error al consultar');
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, [initialCedula]);

  const descargarPDF = async () => {
    if (!participante) return;
    const tablas = participante.tablas || [];
    if (!tablas.length) {
      setError('El participante no tiene tablas asignadas');
      return;
    }

    const pdf = new jsPDF({ unit: 'px', format: 'a4' });

    try {
      for (let i = 0; i < tablas.length; i++) {
        const tabla = tablas[i];
        // Crear un contenedor temporal con la representación de la tabla usando nodos DOM
        const el = document.createElement('div');
        el.style.width = '792px';
        el.style.padding = '16px';
        el.style.boxSizing = 'border-box';
        el.style.background = '#ffffff';
        el.style.fontFamily = 'Arial, Helvetica, sans-serif';
        el.style.color = '#111';

        const title = document.createElement('h2');
        title.textContent = `Tablas asignadas - Serial: ${tabla.serial || ''}`;
        el.appendChild(title);

        const p = document.createElement('p');
        p.innerHTML = `<strong>Participante:</strong> ${participante.nombre || ''} ${participante.apellido || ''} - Cédula: ${participante.cedula || ''}`;
        el.appendChild(p);

        // Header B I N G O
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.gap = '6px';
        headerDiv.style.justifyContent = 'center';
        headerDiv.style.marginTop = '12px';
        ['B','I','N','G','O'].forEach((ltr) => {
          const cell = document.createElement('div');
          cell.style.width = '48px';
          cell.style.height = '36px';
          cell.style.display = 'flex';
          cell.style.alignItems = 'center';
          cell.style.justifyContent = 'center';
          cell.style.fontWeight = '800';
          cell.textContent = ltr;
          headerDiv.appendChild(cell);
        });
        el.appendChild(headerDiv);

        // Grid de 5x5
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
        grid.style.gap = '6px';
        grid.style.marginTop = '8px';

        // Normalizar matrix a 2D 5x5
        let mat = tabla.matrix || [];
        if (Array.isArray(mat) && mat.length && !Array.isArray(mat[0])) {
          // array plano -> convertir a 5x5
          const flat = mat.slice(0, 25);
          mat = [];
          for (let r = 0; r < 5; r++) {
            mat.push(flat.slice(r * 5, r * 5 + 5));
          }
        }

        if (!Array.isArray(mat) || !mat.length) {
          // rellenar vacíos
          mat = Array.from({length:5}, () => Array.from({length:5}, () => ''));
        }

        // Añadir filas y celdas
        mat.forEach((row) => {
          row.forEach((cellValue) => {
            const cell = document.createElement('div');
            cell.style.width = '48px';
            cell.style.height = '48px';
            cell.style.border = '1px solid #ddd';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontWeight = '600';
            cell.textContent = (cellValue === null || cellValue === undefined) ? '' : String(cellValue);
            grid.appendChild(cell);
          });
        });

        el.appendChild(grid);

        document.body.appendChild(el);
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        document.body.removeChild(el);
      }

      pdf.save(`tablas_${participante.cedula || 'participante'}.pdf`);
    } catch (err) {
      console.error('Error generando PDF', err);
      setError('Error generando PDF');
    }
  };

  const renderMatrixHTML = (matrix) => {
    if (!matrix || !Array.isArray(matrix)) return '';
    // matrix is assumed to be an array of rows or a flat array; try to format in 5x5
    // If matrix is flat array of 25 items, render as 5x5
    let flat = [];
    const header = `
      <div style=\"display:flex; gap:6px; justify-content:center; margin-bottom:8px;\">
        <div style=\"width:48px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;\">B</div>
        <div style=\"width:48px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;\">I</div>
        <div style=\"width:48px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;\">N</div>
        <div style=\"width:48px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;\">G</div>
        <div style=\"width:48px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;\">O</div>
      </div>
    `;

    if (Array.isArray(matrix) && matrix.length && Array.isArray(matrix[0])) {
      // Already 2D
      const rowsHtml = matrix.map(row => `
        <div style=\"display:flex; gap:6px; justify-content:center;\">${row.map(cell => `<div style=\\\"width:48px;height:48px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-weight:600;\\\">${cell}</div>`).join('')}</div>
      `).join('');
      return header + rowsHtml;
    } else {
      flat = matrix.slice(0, 25);
      const rows = [];
      for (let r = 0; r < 5; r++) {
        const cells = flat.slice(r * 5, r * 5 + 5);
        rows.push(`<div style=\\\"display:flex; gap:6px; justify-content:center;\\\">${cells.map(cell => `<div style=\\\"width:48px;height:48px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;font-weight:600;\\\">${cell}</div>`).join('')}</div>`);
      }
      return header + rows.join('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscar participante por cédula y descargar tablas</h1>

      <form onSubmit={buscar} className="flex gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
        <button type="button" onClick={() => { setCedula(''); setParticipante(null); setError(null); }} className="ml-2 text-sm text-gray-600">Limpiar</button>
      </form>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {participante && (
        <div className="mt-4">
          <div className="p-4 border rounded mb-4">
            <p><strong>Nombre:</strong> {participante.nombre} {participante.apellido}</p>
            <p><strong>Cédula:</strong> {participante.cedula}</p>
            <p><strong>Nivel/Curso:</strong> {participante.nivelCurso} {participante.paralelo}</p>
            <p><strong>Tablas asignadas:</strong> {participante.tablas?.length || 0}</p>
          </div>

          <div>
            <p><strong>Tablas asignadas:</strong> {participante.tablas?.length || 0}</p>

            <div className="mt-6">
              <button
                onClick={descargarPDF}
                disabled={!(participante.tablas && participante.tablas.length)}
                className={`px-4 py-2 rounded text-white ${participante.tablas && participante.tablas.length ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Descargar PDF de tablas
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={printRef} style={{display: 'none'}}></div>
    </div>
  );
};

const renderMatrixPreview = (matrix) => {
  if (!matrix) return null;
  let content = null;
  // Header B I N G O
  const header = (
    <div style={{display:'flex', gap:6, justifyContent:'center', marginBottom:8}}>
      {['B','I','N','G','O'].map((l) => (
        <div key={l} style={{width:48, height:36, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800}}>{l}</div>
      ))}
    </div>
  );

  if (Array.isArray(matrix) && matrix.length && Array.isArray(matrix[0])) {
    content = (
      <>
        {header}
        {matrix.map((row, ri) => (
          <div key={ri} style={{display:'flex', gap:6, justifyContent:'center'}}>
            {row.map((cell, ci) => (
              <div key={ci} style={{width:48, height:48, border:'1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600}}>{cell}</div>
            ))}
          </div>
        ))}
      </>
    );
  } else {
    const flat = matrix.slice(0,25);
    const rows = [];
    for (let r = 0; r < 5; r++) {
      const cells = flat.slice(r*5, r*5+5);
      rows.push(
        <div key={r} style={{display:'flex', gap:6, justifyContent:'center'}}>
          {cells.map((cell, ci) => (
            <div key={ci} style={{width:48, height:48, border:'1px solid #ddd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600}}>{cell}</div>
          ))}
        </div>
      );
    }
    content = (
      <>
        {header}
        {rows}
      </>
    );
  }

  return content;
};

export default BuscarParticipante;
