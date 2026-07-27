import { Observable } from "rxjs";
import { GetAgendaSeriesPort } from "../../domain/ports/get-agenda-series.port";
import { GetAgendaSeriesResponse } from "../../domain/models/agenda-series.model";

export class GetAgendaSeriesService {
  constructor(private getAgendaSeriesPort: GetAgendaSeriesPort) {}

  getAgendaSeries(seriesId: string): Observable<GetAgendaSeriesResponse> {
    return this.getAgendaSeriesPort.getAgendaSeries(seriesId);
  }
}
