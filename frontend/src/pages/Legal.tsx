import { useSettings } from '../lib/settings';

// Textos base. Deben ser revisados por el hotel antes de publicarse.

export function Privacy() {
  const { settings } = useSettings();
  return (
    <article className="prose-legal mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="eyebrow">Ley 1581 de 2012</span>
      <h1 className="serif mb-6 text-5xl text-olive">Política de tratamiento de datos personales</h1>
      <p>
        {settings.hotelName}, con domicilio en {settings.address}, es responsable del tratamiento de los datos personales que
        recolecta a través de este sitio web, en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013.
      </p>
      <h2>Datos que recolectamos</h2>
      <ul>
        <li>Nombre completo.</li>
        <li>Número de WhatsApp o teléfono de contacto.</li>
        <li>Fechas de estadía, número de personas y comentarios de la solicitud de reserva.</li>
        <li>Nombre y comentario de las reseñas que publiques voluntariamente.</li>
      </ul>
      <h2>Finalidad</h2>
      <ul>
        <li>Gestionar y confirmar tus solicitudes de reserva.</li>
        <li>Comunicarnos contigo sobre tu estadía.</li>
        <li>Publicar las reseñas que decidas compartir.</li>
        <li>Cumplir obligaciones legales y contables.</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>
        Como titular puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, revocar la autorización otorgada
        y presentar quejas ante la Superintendencia de Industria y Comercio.
      </p>
      <h2>Contacto</h2>
      <p>
        Para ejercer tus derechos escríbenos a <a className="underline" href={`mailto:${settings.email}`}>{settings.email}</a> o al
        WhatsApp +{settings.whatsappNumber}. Responderemos en los plazos establecidos por la ley.
      </p>
      <h2>Seguridad y conservación</h2>
      <p>
        Tus datos se almacenan en servidores propios del hotel con acceso restringido al personal autorizado y se conservan
        mientras sea necesario para las finalidades descritas.
      </p>
    </article>
  );
}

export function Rules() {
  return (
    <article className="prose-legal mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="eyebrow">Para una estadía en armonía</span>
      <h1 className="serif mb-6 text-5xl text-olive">Reglas de convivencia y cancelación</h1>
      <h2>Horarios</h2>
      <ul>
        <li>Check-in: desde las 3:00 p. m.</li>
        <li>Check-out: hasta las 12:00 m.</li>
        <li>Horario de silencio: de 10:00 p. m. a 7:00 a. m.</li>
      </ul>
      <h2>Convivencia</h2>
      <ul>
        <li>Respeta la quietud del bosque y a los demás huéspedes.</li>
        <li>No está permitido extraer flora ni alimentar o molestar la fauna.</li>
        <li>Deposita los residuos en los puntos de reciclaje.</li>
        <li>Las actividades en el río se realizan siempre con chaleco y guía.</li>
        <li>Nos reservamos el derecho de admisión para garantizar un ambiente familiar y pacífico.</li>
      </ul>
      <h2>Reservas y pagos</h2>
      <p>
        Las solicitudes hechas en este sitio quedan en estado pendiente hasta que el hotel las confirme por WhatsApp. La confirmación
        puede requerir un anticipo.
      </p>
      <h2>Cancelaciones</h2>
      <ul>
        <li>Con más de 15 días de anticipación: devolución total del anticipo.</li>
        <li>Entre 7 y 15 días: devolución del 50% o cambio de fecha sin costo.</li>
        <li>Con menos de 7 días o no presentarse: no hay devolución del anticipo.</li>
      </ul>
    </article>
  );
}
