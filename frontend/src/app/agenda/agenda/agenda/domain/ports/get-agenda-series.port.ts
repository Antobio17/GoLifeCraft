import { Observable } from "rxjs";
import { GetAgendaSeriesResponse } from "../models/agenda-series.model";

export abstract class GetAgendaSeriesPort {
  abstract getAgendaSeries(
    seriesId: string,
  ): Observable<GetAgendaSeriesResponse>;
}
