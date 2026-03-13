-- 4. AUTOMATED CLEANUP TRIGGER
-- When a show is CONFIRMED, immediately kill all other pending offers for that date/party.
CREATE OR REPLACE FUNCTION public.confirm_and_clear()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' THEN
    UPDATE public."Gig"
    SET status = 'CANCELLED', "isActive" = false
    WHERE "date" = NEW."date" 
    AND ("bandId" = NEW."bandId" OR "venueId" = NEW."venueId" OR "bandId" = NEW."venueId" OR "venueId" = NEW."bandId")
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_on_confirm ON public."Gig";

CREATE TRIGGER trigger_cleanup_on_confirm
AFTER UPDATE OF status ON public."Gig"
FOR EACH ROW EXECUTE FUNCTION public.confirm_and_clear();
