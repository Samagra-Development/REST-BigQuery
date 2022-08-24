// const {BigQuery} = require('@google-cloud/bigquery');
import { BigQuery } from '@google-cloud/bigquery'
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private bigQueryService: BigQuery,
    ) {}

  getHello(): string {
    return 'REST-BigQuery Service Running!!';
  }
  
  getObjPath(path, obj, fallback = ''): string {
    return path.split('.').reduce((res, key) => res[key] || fallback, obj);
  };

  interpolate(template, variables, fallback): string {
    console.log({ template, variables, fallback });
    const regex = /\${[^{]+}/g;
    return template.replace(regex, (match) => {
      const path = match.slice(2, -1).trim();
      return this.getObjPath(path, variables, fallback);
    });
  };

  async getQuery(label: string): Promise<any> {
    return await this.prisma.queries.findUnique({
      where: {
        label: label,
      }
    })
  }

  async addQuery(data: Prisma.queriesCreateInput): Promise<any> {
    return await this.prisma.queries.create({
      data: data,
    })
  }

  async updateQuery(label: string, data: Prisma.queriesUpdateInput): Promise<any> {
    return await this.prisma.queries.update({
      where: {
        label: label,
      },
      data: data,
    })
  }

  async deleteQuery(label: string): Promise<any> {
    return await this.prisma.queries.delete({
      where: {
        label: label,
      }
    })
  }

  async executeQuery(query: string, data: any, fallback: string = ''): Promise<any> {
    try {
      // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    query = this.interpolate(query, data, fallback);
    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'asia-south2',
    };

    //Create Client
    // const bigqueryClient = new BigQuery();

    // Run the query as a job
    const [job] = await this.bigQueryService.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Print the results
    console.log('Rows:');
    rows.forEach(row => console.log(row));
    return {
      jobId: job.id,
      rows: rows
    }
    } catch (error) {
      throw new BadRequestException({
        err: "Failed to Run Query",
        errMsg: error.message,
      })
    }
    
  }
}
