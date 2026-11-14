import gdgLogo from '../assets/gdg-logo.png';

export default function PrintHeader() {
  return (
    /* Printable Header with Logo (Visible only on print/PDF) */
    <div className="hidden print:block mb-6 border-b-2 border-slate-300 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={gdgLogo} alt="GDG On Campus" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">GDG On Campus Damanhour</h1>
            <p className="text-xs text-slate-600 font-semibold">تقرير التقييم الشهري التفاعلي للجان (Monthly Evaluation Report)</p>
          </div>
        </div>
        <div className="text-left text-xs text-slate-600 font-bold">
          <p>Google Developer Groups On Campus</p>
          <p>Damanhour University</p>
        </div>
      </div>
    </div>
  );
}
