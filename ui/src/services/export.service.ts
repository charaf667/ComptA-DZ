import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import type { ProcessedDocument } from '../types/document-history';

/**
 * Service pour l'exportation de données
 */
class ExportService {
  /**
   * Exporte les documents au format PDF
   */
  exportDocumentsToPdf(documents: ProcessedDocument[], title: string = 'Historique des Documents'): void {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Ajouter le titre et les métadonnées
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le ${currentDate}`, 14, 30);
    
    // Préparer les données pour le tableau
    const tableColumn = ["Nom du fichier", "Date", "Fournisseur", "Montant", "Compte"];
    const tableRows: any[] = [];
    
    documents.forEach(document => {
      const documentData = [
        document.filename,
        new Date(document.processedAt).toLocaleDateString('fr-FR'),
        document.extractedData.fournisseur || 'Non spécifié',
        document.extractedData.montant ? `${document.extractedData.montant.toFixed(2)} DZD` : 'N/A',
        document.selectedAccount ? `${document.selectedAccount.compteCode} - ${document.selectedAccount.libelleCompte}` : 'Non assigné'
      ];
      tableRows.push(documentData);
    });
    
    // Générer le tableau
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
    
    // Ajouter des métadonnées au document
    doc.setProperties({
      title: title,
      subject: 'Documents exportés depuis ComptaDZ',
      author: 'ComptaDZ',
      keywords: 'comptabilité, documents, historique',
      creator: 'ComptaDZ Export Service'
    });
    
    // Télécharger le PDF
    doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  /**
   * Exporte les documents au format Excel
   */
  async exportDocumentsToExcel(documents: ProcessedDocument[], title: string = 'Historique des Documents'): Promise<void> {
    // Créer un nouveau classeur Excel
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ComptaDZ';
    workbook.lastModifiedBy = 'ComptaDZ Export Service';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Ajouter une feuille de calcul
    const worksheet = workbook.addWorksheet('Documents');
    
    // Définir les colonnes
    worksheet.columns = [
      { header: 'Nom du fichier', key: 'filename', width: 30 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Fournisseur', key: 'supplier', width: 25 },
      { header: 'Montant', key: 'amount', width: 15 },
      { header: 'Compte', key: 'account', width: 30 },
      { header: 'Tags', key: 'tags', width: 25 },
      { header: 'ID Document', key: 'id', width: 35 }
    ];
    
    // Appliquer un style à l'en-tête
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4051B5' }
    };
    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFF' }
    };
    
    // Ajouter les données
    documents.forEach(document => {
      worksheet.addRow({
        filename: document.filename,
        date: new Date(document.processedAt).toLocaleDateString('fr-FR'),
        supplier: document.extractedData.fournisseur || 'Non spécifié',
        amount: document.extractedData.montant ? `${document.extractedData.montant.toFixed(2)} DZD` : 'N/A',
        account: document.selectedAccount ? `${document.selectedAccount.compteCode} - ${document.selectedAccount.libelleCompte}` : 'Non assigné',
        tags: document.tags ? document.tags.join(', ') : '',
        id: document.id
      });
    });
    
    // Appliquer des styles aux lignes alternées
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Ignorer l'en-tête
        if (rowNumber % 2 === 0) { // Lignes paires
          row.eachCell({ includeEmpty: false }, cell => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'F0F0F0' }
            };
          });
        }
      }
    });
    
    // Générer le fichier Excel et le télécharger
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement et cliquer dessus automatiquement
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    
    // Libérer l'URL
    window.URL.revokeObjectURL(url);
  }
  
  /**
   * Exporte un document spécifique au format PDF
   */
  exportSingleDocumentToPdf(document: ProcessedDocument): void {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Ajouter le titre et les métadonnées
    doc.setFontSize(18);
    doc.text('Détails du Document', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le ${currentDate}`, 14, 30);
    
    // Ajouter les informations du document
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Informations générales', 14, 45);
    
    const infoData = [
      ['Nom du fichier', document.filename],
      ['Date de traitement', new Date(document.processedAt).toLocaleDateString('fr-FR')],
      ['Dernière modification', document.lastEditedAt ? new Date(document.lastEditedAt).toLocaleDateString('fr-FR') : 'Jamais modifié'],
      ['ID Document', document.id]
    ];
    
    (doc as any).autoTable({
      body: infoData,
      startY: 50,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });
    
    // Ajouter les données extraites
    doc.text('Données extraites', 14, (doc as any).previousAutoTable.finalY + 15);
    
    const extractedData = [
      ['Fournisseur', document.extractedData.fournisseur || 'Non spécifié'],
      ['Montant', document.extractedData.montant ? `${document.extractedData.montant.toFixed(2)} DZD` : 'N/A'],
      ['Référence', document.extractedData.reference || 'Non spécifiée'],
      ['Date', document.extractedData.date ? new Date(document.extractedData.date).toLocaleDateString('fr-FR') : 'Non spécifiée']
    ];
    
    (doc as any).autoTable({
      body: extractedData,
      startY: (doc as any).previousAutoTable.finalY + 20,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });
    
    // Ajouter les informations comptables
    doc.text('Informations comptables', 14, (doc as any).previousAutoTable.finalY + 15);
    
    const accountData = [
      ['Compte', document.selectedAccount ? `${document.selectedAccount.compteCode} - ${document.selectedAccount.libelleCompte}` : 'Non assigné'],
      ['Écriture comptable', document.hasAccountingEntry ? 'Générée' : 'Non générée'],
      ['Tags', document.tags && document.tags.length > 0 ? document.tags.join(', ') : 'Aucun tag']
    ];
    
    (doc as any).autoTable({
      body: accountData,
      startY: (doc as any).previousAutoTable.finalY + 20,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });
    
    // Ajouter des métadonnées au document
    doc.setProperties({
      title: `Document - ${document.filename}`,
      subject: 'Document exporté depuis ComptaDZ',
      author: 'ComptaDZ',
      keywords: 'comptabilité, document, détails',
      creator: 'ComptaDZ Export Service'
    });
    
    // Télécharger le PDF
    doc.save(`Document_${document.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  /**
   * Intègre les documents dans un rapport financier
   */
  generateFinancialReport(documents: ProcessedDocument[], reportData: { topSuppliers?: any[]; topAccounts?: any[] }, reportType: 'mensuel' | 'trimestriel' | 'annuel'): void {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');
    
    // Définir le titre du rapport
    let reportTitle = '';
    let periodText = '';
    
    const today = new Date();
    const startDate = new Date();
    
    switch (reportType) {
      case 'mensuel':
        reportTitle = 'Rapport Financier Mensuel';
        startDate.setMonth(startDate.getMonth() - 1);
        periodText = `Période: ${startDate.toLocaleDateString('fr-FR')} - ${today.toLocaleDateString('fr-FR')}`;
        break;
      case 'trimestriel':
        reportTitle = 'Rapport Financier Trimestriel';
        startDate.setMonth(startDate.getMonth() - 3);
        periodText = `Période: ${startDate.toLocaleDateString('fr-FR')} - ${today.toLocaleDateString('fr-FR')}`;
        break;
      case 'annuel':
        reportTitle = 'Rapport Financier Annuel';
        startDate.setFullYear(startDate.getFullYear() - 1);
        periodText = `Période: ${startDate.toLocaleDateString('fr-FR')} - ${today.toLocaleDateString('fr-FR')}`;
        break;
    }
    
    // Ajouter l'en-tête du rapport
    doc.setFontSize(22);
    doc.setTextColor(41, 80, 180); // Bleu foncé
    doc.text(reportTitle, 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gris
    doc.text(`Généré le ${currentDate}`, 105, 27, { align: 'center' });
    doc.text(periodText, 105, 32, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Noir
    
    // Ajouter un résumé des documents
    doc.setFontSize(16);
    doc.setTextColor(60, 60, 60);
    doc.text('Résumé des Documents', 14, 42);
    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, 44, 196, 44);
    
    doc.setFontSize(11);
    
    // Calculer les statistiques si non fournies
    const totalAmount = documents.reduce((sum, doc) => sum + (doc.extractedData.montant || 0), 0);
    const suppliers = new Set(documents.map(doc => doc.extractedData.fournisseur || 'Non spécifié'));
    const accounts = new Set();
    documents.forEach(doc => {
      if (doc.selectedAccount) {
        accounts.add(doc.selectedAccount.compteCode);
      }
    });
    
    // Afficher les statistiques
    doc.setFontSize(10);
    doc.text(`Nombre total de documents: ${documents.length}`, 14, 52);
    doc.text(`Montant total: ${totalAmount.toFixed(2)} DZD`, 14, 59);
    doc.text(`Nombre de fournisseurs: ${suppliers.size}`, 14, 66);
    doc.text(`Nombre de comptes utilisés: ${accounts.size}`, 14, 73);
    
    // Si des données sur les fournisseurs sont fournies, les ajouter
    let yPosition = 85;
    
    if (reportData.topSuppliers && reportData.topSuppliers.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('Principaux Fournisseurs', 14, yPosition);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition + 2, 196, yPosition + 2);
      
      yPosition += 10;
      doc.setFontSize(9);
      
      // @ts-ignore
      doc.autoTable({
        startY: yPosition,
        head: [['Fournisseur', 'Nombre de documents', 'Montant total (DZD)']], 
        body: reportData.topSuppliers.map(supplier => [
          supplier.name,
          supplier.count.toString(),
          supplier.amount.toFixed(2)
        ]),
        headStyles: {
          fillColor: [65, 81, 181],
          textColor: [255, 255, 255]
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto'
      });
      
      // @ts-ignore
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Si des données sur les comptes sont fournies, les ajouter
    if (reportData.topAccounts && reportData.topAccounts.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text('Principaux Comptes', 14, yPosition);
      doc.setLineWidth(0.5);
      doc.line(14, yPosition + 2, 196, yPosition + 2);
      
      yPosition += 10;
      doc.setFontSize(9);
      
      // @ts-ignore
      doc.autoTable({
        startY: yPosition,
        head: [['Code', 'Libellé', 'Nombre de documents', 'Montant total (DZD)']], 
        body: reportData.topAccounts.map(account => [
          account.code,
          account.name,
          account.count.toString(),
          account.amount.toFixed(2)
        ]),
        headStyles: {
          fillColor: [65, 81, 181],
          textColor: [255, 255, 255]
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto'
      });
      
      // @ts-ignore
      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Ajouter la liste des documents
    // Ajouter une nouvelle page si nécessaire
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.text('Liste des Documents', 14, yPosition);
    doc.setLineWidth(0.5);
    doc.setDrawColor(220, 220, 220);
    doc.line(14, yPosition + 2, 196, yPosition + 2);
    
    // Créer un tableau pour les documents
    const tableColumn = ["Nom du fichier", "Date", "Fournisseur", "Montant", "Compte"];
    const tableRows: any[] = [];
    
    documents.forEach(document => {
      const documentData = [
        document.filename,
        new Date(document.processedAt).toLocaleDateString('fr-FR'),
        document.extractedData.fournisseur || 'Non spécifié',
        document.extractedData.montant ? `${document.extractedData.montant.toFixed(2)} DZD` : 'N/A',
        document.selectedAccount ? `${document.selectedAccount.compteCode} - ${document.selectedAccount.libelleCompte}` : 'Non assigné'
      ];
      tableRows.push(documentData);
    });
    
    // @ts-ignore
    doc.autoTable({
      startY: yPosition + 5,
      head: [tableColumn],
      body: tableRows,
      headStyles: {
        fillColor: [65, 81, 181],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
        lineColor: [220, 220, 220]
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [220, 220, 220]
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 10 }
    });
    
    // Ajouter des métadonnées au document
    doc.setProperties({
      title: reportTitle,
      subject: 'Rapport financier généré depuis ComptaDZ',
      author: 'ComptaDZ',
      keywords: 'comptabilité, rapport, financier',
      creator: 'ComptaDZ Export Service'
    });
    
    // Télécharger le PDF
    doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  // La méthode groupBy a été supprimée car elle n'est plus utilisée
}

export default new ExportService();
